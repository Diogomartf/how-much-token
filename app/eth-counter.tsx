"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
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

function filterEthTokens(tokens: Token[]) {
  return tokens.filter(
    token => token.symbol && token.symbol.toLowerCase().includes("eth")
  );
}

function filterOutDustTokens(tokens: Token[], dustThreshold: number = 0.0001) {
  return tokens.filter(token => {
    const amount = parseFloat(formatEther(token.amount));
    const isNotDust = amount > dustThreshold;
    const isHoldingsBiggerThanOneDollar = token.value_usd > 1;
    const isNotFakeETH = token.price_usd > 1000;
    const isSymbolETHorWETH =
      token.symbol.toUpperCase() === "WETH" ||
      token.symbol.toUpperCase() === "ETH";
    const isChainGnosis = token.chain_id === 100;

    if (token.price_usd)
      return isNotDust && isHoldingsBiggerThanOneDollar && isNotFakeETH;

    return isChainGnosis && isSymbolETHorWETH;
  });
}

function sortTokensByValueUsd(tokens: Token[]) {
  return tokens.sort((a, b) => b.value_usd - a.value_usd);
}

function calcTotalEth(tokens: Token[]) {
  return tokens
    .reduce((total, token) => {
      return total + parseFloat(formatEther(token.amount));
    }, 0)
    .toFixed(4);
}

export const EthCounter = ({ address }: { address: Address }) => {
  const { data, isLoading } = useQuery(
    ["dune-data", address],
    () => fetchDuneData(address),
    {
      enabled: !!address,
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const { sortedTokens, totalEth } = useMemo(() => {
    if (!data?.balances) {
      return {
        ethTokens: [],
        filteredTokens: [],
        sortedTokens: [],
        totalEth: "0.0000",
      };
    }
    const ethTokens = filterEthTokens(data.balances);
    const filteredTokens = filterOutDustTokens(ethTokens);
    const sortedTokens = sortTokensByValueUsd(filteredTokens);
    const totalEth = calcTotalEth(filteredTokens);

    return { ethTokens, filteredTokens, sortedTokens, totalEth };
  }, [data?.balances]);

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
          {totalEth}
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
        ethAmount: acc.ethAmount + parseFloat(formatEther(token.amount)),
        usdValue: acc.usdValue + (token.value_usd || 0),
      }),
      { ethAmount: 0, usdValue: 0 }
    );
  }, [tokens]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ETH</TableHead>
          <TableHead>value ($)</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Chain</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map(token => (
          <TableRow key={token.chain_id + token.address}>
            <TableCell>
              {parseFloat(formatEther(token.amount)).toFixed(4)}
            </TableCell>
            <TableCell>
              {token.value_usd ? formatCurrency(token.value_usd) : "-"}
            </TableCell>
            <TableCell>{token.symbol}</TableCell>
            <TableCell>{token.chain}</TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold border-t-2">
          <TableCell>{totals?.ethAmount.toFixed(4)}</TableCell>
          <TableCell>{formatCurrency(totals.usdValue)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default TokenTable;
