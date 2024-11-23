"use client";

import { useState, useRef, useMemo } from "react";
import { TokenCounter } from "@/app/token-counter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Address } from "viem";
import {
  Drawer,
  DrawerClose,
  DrawerFooter,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEnsName } from "wagmi";
import { Combobox } from "@/components/combobox";

const VITALIK_ETH_ADDRESS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

const shortenAddress = (address: string) => {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}..${address.slice(-4)}`;
};

const selectTokens = [
  {
    value: "eth",
    label: "ETH",
  },
  {
    value: "wbtc",
    label: "WBTC",
  },
];

export const HowMuchToken = () => {
  const [address, setAddress] = useState(VITALIK_ETH_ADDRESS);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(selectTokens[0].value);

  const inputRef = useRef<HTMLInputElement>(null);

  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address: address as Address,
    chainId: 1,
  });

  const displayAddress = useMemo(() => {
    if (isEnsLoading) return ". . .";
    if (ensName) return ensName;
    return shortenAddress(address);
  }, [address, ensName, isEnsLoading]);

  const updateAddress = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newAddress = inputRef.current?.value || "";
    setAddress(newAddress);
    setIsOpen(false);
  };

  return (
    <div className="space-y-8  w-full max-w-md mx-auto">
      <div className="space-y-1">
        <h1 className="justify-center flex flex-wrap gap-2 items-center text-3xl md:text-4xl font-bold">
          How much{" "}
          <div>
            <Combobox
              tokens={selectTokens}
              setValue={setSelectedToken}
              value={selectedToken}
            />
          </div>{" "}
          does{" "}
          <div
            className="text-teal-600 dark:text-teal-300 p-3 bg-teal-50 dark:bg-teal-800 rounded-lg hover:bg-teal-100 flex justify-center relative cursor-pointer min-w-32"
            onClick={() => setIsOpen(true)}
          >
            {displayAddress}
            <div className="absolute -top-1 -right-2 text-xs rotate-12 dark:text-teal-300">
              wallet
            </div>
          </div>
          hold?
        </h1>
      </div>
      <TokenCounter address={address as Address} tokenSymbol={selectedToken} />
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-w-3xl mx-auto">
          <DrawerHeader>
            <DrawerTitle>Change address</DrawerTitle>
            <DrawerDescription>Use an EVM address</DrawerDescription>
            <Input
              type="text"
              placeholder="insert address"
              defaultValue={address}
              ref={inputRef}
            />
          </DrawerHeader>
          <DrawerFooter>
            <Button className="w-full" onClick={updateAddress}>
              Update
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
