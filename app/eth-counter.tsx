"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { formatEther, Address } from "viem";
import { useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

const fetchDuneData = async (address: string) => {
  const options = {
    method: "GET",
    headers: { "X-Dune-Api-Key": process.env.NEXT_PUBLIC_DUNE_APY_KEY },
  };

  const response = await fetch(
    `https://api.dune.com/api/echo/v1/balances/evm/${address}?metadata=logo`,
    options as RequestInit
  );
  return await response.json();
};

function filterTokensBySymbol(tokens: Token[], symbol = "eth") {
  return tokens.filter(
    token => token.symbol && token.symbol.toLowerCase().includes(symbol)
  );
}

const GNOSIS_CHAIN_ID = 100;

function priceLooksCorrect(token: Token, tokenSymbol: string) {
  if (token.chain_id === GNOSIS_CHAIN_ID) return true;

  if (!token.price_usd) return null;

  if (tokenSymbol.toLowerCase() === "wbtc") return token.price_usd > 50000;

  return token.price_usd > 2000;
}

function filterCorrectPricing(tokens: Token[], tokenSymbol: string) {
  return tokens.filter(token => {
    return priceLooksCorrect(token, tokenSymbol);
  });
}

function calculateTokenAmount(amount: bigint, decimals: number): number {
  const amountBigInt = BigInt(amount);
  const divisor = BigInt(10 ** decimals);

  const wholePart = amountBigInt / divisor;
  const remainder = amountBigInt % divisor;

  const decimalPart = Number(remainder) / Number(divisor);
  return Number(wholePart) + decimalPart;
}

function filterOutDustTokens(tokens: Token[], symbol: string = "eth") {
  return tokens.filter(token => {
    const dustThreshold = symbol.toLowerCase() === "wbc" ? 0.0000001 : 0.0001;
    const amount = calculateTokenAmount(token.amount, token.decimals);
    const isAmountNotDust = amount > dustThreshold;
    const isHoldingsBiggerThanOneDollar = token.value_usd > 1;
    const isChainGnosis = token.chain_id === GNOSIS_CHAIN_ID;

    if (isChainGnosis) return true;

    return isAmountNotDust && isHoldingsBiggerThanOneDollar;
  });
}

function sortTokensByValueUsd(tokens: Token[]) {
  return tokens.sort((a, b) => b.value_usd - a.value_usd);
}

function calcTotalAmount(tokens: Token[]) {
  return tokens
    .reduce((total, token) => {
      return total + calculateTokenAmount(token.amount, token.decimals);
    }, 0)
    .toFixed(4);
}

export const EthCounter = ({
  address,
  tokenSymbol,
}: {
  address: Address;
  tokenSymbol: string;
}) => {
  const { data, isLoading } = useQuery(
    ["dune-data", address],

    () => fetchDuneData(address),
    {
      enabled: !!address,
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const { sortedTokens, totalAmount } = useMemo(() => {
    if (!data?.balances) {
      return {
        sortedTokens: [],
        totalAmount: "0.0000",
      };
    }

    const tokens = filterTokensBySymbol(data.balances, tokenSymbol);
    const filterOutDustTokenz = filterOutDustTokens(tokens, tokenSymbol);
    const filterPricing = filterCorrectPricing(
      filterOutDustTokenz,
      tokenSymbol
    );
    const sortedTokens = sortTokensByValueUsd(filterPricing);
    const totalAmount = calcTotalAmount(filterPricing);

    return { sortedTokens, totalAmount };
  }, [data?.balances, tokenSymbol]);

  if (isLoading)
    return (
      <div className="space-y-5">
        <div className="p-4 h-16 bg-stone-100 dark:bg-stone-800 animate-pulse rounded-lg"></div>
        <div className="p-4 h-12 bg-stone-100 dark:bg-stone-800 animate-pulse rounded-lg"></div>
      </div>
    );

  return (
    <>
      <div className="flex items-center justify-center space-x-2">
        <Image
          src="/eth-logo.svg"
          alt="ETH logo"
          width={373}
          height={612}
          className="w-fit h-8"
        />
        <p className="text-4xl font-[family-name:var(--font-geist-mono)]">
          {totalAmount}
        </p>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Based on</AccordionTrigger>
          <AccordionContent>
            <TokenTable tokens={sortedTokens} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

type Token = {
  symbol: string;
  chain_id: number;
  price_usd: number;
  value_usd: number;
  decimals: number;
  amount: bigint;
  address: string;
  chain: string;
};

export const formatCurrency = (amount: number) => {
  return "$" + amount?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const TokenTable = ({ tokens }: { tokens: Token[] }) => {
  const totals = useMemo(() => {
    return tokens.reduce(
      (acc, token) => ({
        amount: acc.amount + parseFloat(formatEther(token.amount)),
        usdValue: acc.usdValue + (token.value_usd || 0),
      }),
      { amount: 0, usdValue: 0 }
    );
  }, [tokens]);

  const formatAmount = (amount: bigint) => {
    const parsedAmount = parseFloat(formatEther(amount)).toFixed(5);

    return Number(parsedAmount) < 0.0001 ? "<0.00001" : parsedAmount;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>value ($)</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Chain</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map(token => (
          <TableRow key={token.chain_id + token.address}>
            <TableCell>{formatAmount(token.amount)}</TableCell>
            <TableCell>
              {token.value_usd ? formatCurrency(token.value_usd) : "-"}
            </TableCell>
            <TableCell>{token.symbol}</TableCell>
            <TableCell>{token.chain}</TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold border-t-2">
          <TableCell>{totals?.amount.toFixed(4)}</TableCell>
          <TableCell>{formatCurrency(totals.usdValue)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default TokenTable;
