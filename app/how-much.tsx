"use client";

import { useState, useRef } from "react";
import { EthCounter } from "@/app/eth-counter";
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

const VITALIK_ETH_ADDRESS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

export const HowMuch = () => {
  const [address, setAddress] = useState(VITALIK_ETH_ADDRESS);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const updateAddress = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newAddress = inputRef.current?.value || "";
    setAddress(newAddress);
    setIsOpen(false);
  };

  const shortenAddress = (address: string) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 8)}..${address.slice(-8)}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex w-full max-w-sm items-center space-x-2"></div>
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold">
          How much ETH does the{" "}
          <div
            className="text-teal-600 p-2 bg-teal-50 rounded-lg hover:bg-teal-100 flex justify-center relative cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            {shortenAddress(address)}
            <div className="absolute -top-1 -right-2 text-xs rotate-12">
              wallet
            </div>
          </div>
          hold?
        </h1>
      </div>
      <EthCounter address={address as Address} />
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-center">
          <Button onClick={() => setIsOpen(true)}>change address</Button>
        </div>
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
