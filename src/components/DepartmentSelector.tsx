import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";

import { axiosApi } from "../api/api";
import { cn, emptyArray } from "../utils";

export function DepartmentSelector({
  selectedItems = [],
  setSelectedItems,
  error,
}: {
  selectedItems: Item[];
  setSelectedItems: React.Dispatch<React.SetStateAction<Item[]>>;
  error?: string;
}) {
  const [selected, setSelected] = useState<Item>({ name: "" });
  const [query, setQuery] = useState("");

  const departmentListQuery = useQuery({
    queryKey: ["AdminListDepartmentPage"],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/department/",
        method: "GET",
        params: { type: 1 },
      }).then((e) => e.data.data),
  });
  const items = departmentListQuery.data || emptyArray;
  const filteredItems =
    query === ""
      ? items
      : items.filter(
          (person) =>
            person?.name
              ?.toLowerCase()
              ?.replace(/\s+/g, "")
              ?.includes(query.toLowerCase().replace(/\s+/g, "")),
        );
  return (
    <div className=" ">
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        Skills
      </label>
      <Combobox
        value={selected}
        onChange={(val) => {
          setSelectedItems((prevItems) => prevItems.concat(val));
          setQuery("");
          setSelected({ name: "" });
        }}
      >
        <div className="relative  ">
          <div className="relative w-full cursor-default space-y-2 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            {selectedItems.length === 0 ? null : (
              <div className={cn("flex flex-wrap gap-2")}>
                {selectedItems.map(({ name }, i) => (
                  <div
                    key={i}
                    className="inline-flex space-x-1 rounded bg-[#3BA2B8] px-2 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                  >
                    <span>{name}</span>
                    <button
                      onClick={() =>
                        setSelectedItems((prevItems) =>
                          prevItems.filter((_, index) => index !== i),
                        )
                      }
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative flex items-center">
              <Combobox.Input
                placeholder="Search a skills"
                displayValue={(item: Item) => item.name}
                onChange={(event) => setQuery(event.target.value)}
                className={cn(
                  "text-gray-900 w-full border-none py-2 pl-3 pr-10 text-sm leading-5  focus:ring-0",
                  selectedItems.length > 0 && "mt-2",
                )}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="text-gray-400 h-5 w-5"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredItems.length === 0 && query !== "" ? (
                <Combobox.Option
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-teal-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={{ name: query }}
                >
                  <span className="block truncate  font-normal">
                    Create "{query}"
                  </span>
                </Combobox.Option>
              ) : (
                filteredItems
                  .filter((e) => !selectedItems.map((e) => e.id).includes(e.id))
                  .map((item) => (
                    <Combobox.Option
                      key={item.id}
                      className={({ active }) =>
                        `relative cursor-default select-none px-4 py-2 ${
                          active ? "bg-teal-600 text-white" : "text-gray-900"
                        }`
                      }
                      value={item}
                    >
                      <span className="block truncate  font-normal ">
                        {item.name}
                      </span>
                    </Combobox.Option>
                  ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
        {error ? (
          <span className="mt-2 text-sm text-red-500">{error}</span>
        ) : null}
      </Combobox>
    </div>
  );
}

type Item = {
  name: string;
  id?: number | undefined;
};
