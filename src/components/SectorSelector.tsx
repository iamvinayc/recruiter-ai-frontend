import { sectorsMap } from "@/api/api";
import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { emptyArray } from "../utils";
import { useAutoOpenOnMount } from "./common/useAutoOpenOnMount";

export function SectorSelector({
  selectedItem,
  setSelectedItem,
  error,
  labelClassName,
  className,
}: {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  error?: string;
  labelClassName?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  const items = sectorsMap || emptyArray;

  const { btnRef } = useAutoOpenOnMount();

  // Find the label for the selected item
  const getDisplayValue = (item: string) => {
    const selected = items.find((i) => i.value === item);
    return selected ? selected.label : "";
  };

  return (
    <div>
      <label
        className={clsx(
          "mb-2.5 ml-4 mt-2 block font-medium text-black dark:text-white",
          labelClassName,
        )}
      >
        Sector
      </label>

      <Combobox value={selectedItem} onChange={setSelectedItem}>
        <div className="relative">
          <div
            className={clsx(
              "relative w-full cursor-default space-y-2 overflow-hidden rounded-none border border-slate-200 bg-white p-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm",
              className,
            )}
          >
            <Combobox.Input
              placeholder="Search Sector"
              className="text-gray-900 w-full border-none py-2 pl-3 pr-10 text-sm leading-5 focus:ring-0"
              displayValue={getDisplayValue}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button
              ref={btnRef}
              className="absolute inset-y-0 right-0 flex items-center pb-2 pr-3"
            >
              <ChevronUpDownIcon
                className="text-gray-400 h-5 w-5"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {items
                .filter((item) =>
                  item.label.toLowerCase().includes(query.toLowerCase()),
                )
                .map((item) => (
                  <Combobox.Option
                    key={item.value}
                    className={({ active }) =>
                      `relative cursor-default select-none px-4 py-2 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={item.value}
                  >
                    <span className="block truncate font-normal">
                      {item.label}
                    </span>
                  </Combobox.Option>
                ))}
            </Combobox.Options>
          </Transition>
        </div>
        {error && <span className="mt-2 text-sm text-red-500">{error}</span>}
      </Combobox>
    </div>
  );
}
