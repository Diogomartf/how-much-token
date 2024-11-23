"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Combobox({
  tokens,
  setValue,
  value,
}: {
  tokens: { value: string; label: string }[];
  setValue: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={open}
          className="p-3 bg-yellow-50 dark:bg-yellow-400 flex items-center rounded-lg hover:bg-yellow-100 relative dark:text-yellow-800"
        >
          {value ? tokens.find(token => token.value === value)?.label : "Token"}
          <ChevronsUpDown className="opacity-50" />
          <div className="absolute -top-1 -right-2 text-xs rotate-12 text-yellow-600 dark:text-yellow-800">
            token
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search token..." />
          <CommandList>
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup>
              {tokens.map(token => (
                <CommandItem
                  key={token.value}
                  value={token.value}
                  onSelect={currentValue => {
                    setValue(currentValue === value ? "eth" : currentValue);
                    setOpen(false);
                  }}
                >
                  {token.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === token.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
