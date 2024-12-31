"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Item {
  value: string;
  label: string;
}
interface ComboboxProps {
  label: string;
  placeholder?: string;
  items: Item[];
  selectedValue: string;
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  filter?: (value: string, search: string) => number;
  parentClassName?: string;
}
export function Combobox({
  label = "",
  placeholder = "",
  items = [],
  selectedValue,
  setSelectedValue,
  className = "",
  filter,
  parentClassName,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={parentClassName}>
          {label ? (
            <label className="mx-4 mb-2.5 block font-medium text-black dark:text-white">
              {label}
            </label>
          ) : null}
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between rounded-none", className)}
          >
            <span className="overflow-hidden text-ellipsis">
              {selectedValue
                ? items.find(
                    (item) =>
                      item.value?.toLowerCase() ===
                      selectedValue?.toLowerCase(),
                  )?.label
                : placeholder || `Select ${label}...`}{" "}
            </span>
            <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="PopoverContent w-full p-0 ">
        <Command filter={filter}>
          <CommandInput placeholder={`Search ${label}...`} />
          <CommandEmpty>No {label} found.</CommandEmpty>
          <CommandGroup className="max-h-[30vh] overflow-y-auto">
            {items.map((item, i) => (
              <CommandItem
                key={i}
                value={item.value}
                onSelect={(currentValue) => {
                  console.log("currentValue", currentValue, item);
                  const value = items.find(
                    (item) =>
                      item.value?.toLowerCase() === currentValue?.toLowerCase(),
                  )?.value;
                  setSelectedValue(
                    currentValue === selectedValue ? "" : value || "",
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValue === item.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
