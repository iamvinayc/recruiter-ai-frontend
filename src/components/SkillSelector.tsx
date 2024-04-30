import { axiosApi } from "@/api/api";
import { cn, emptyArray } from "@/utils";
import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { SpinnerIcon } from "./common/SvgIcons";

export const SkillSelector = ({
  selectedItem,
  setSelectedItem,
}: {
  selectedItem: string;
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [query, setQuery] = useState("");
  const departmentListQuery = useQuery({
    queryKey: ["skillSearch", query],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/department/",
        method: "GET",
        params: { type: 1, page_size: 50, name: query },
      })
        .then((e) => e.data.data)
        .then((e) => e.map((e) => ({ value: e.name, label: e.name }))),
  });
  const items = departmentListQuery.data || emptyArray;

  return (
    <div className=" ">
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        Skills
      </label>

      <Combobox
        value={selectedItem}
        onChange={(val) => {
          setSelectedItem(val);
          setQuery("");
        }}
      >
        <div className="relative  ">
          <div className="relative flex items-center overflow-hidden rounded-md border border-slate-300">
            <Combobox.Input
              placeholder="Search a skills"
              displayValue={() => selectedItem}
              onChange={(event) => setQuery(event.target.value)}
              className={cn(
                "text-gray-900 w-full border-none py-2 pl-3 pr-10 text-sm leading-5  focus:ring-0 ",
              )}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              {departmentListQuery.isPending ? (
                <SpinnerIcon className="text-black" />
              ) : (
                <ChevronUpDownIcon
                  className="text-gray-400 h-5 w-5"
                  aria-hidden="true"
                />
              )}
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
              {items.length === 0 && query !== "" ? (
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
                items.map((item, i) => (
                  <Combobox.Option
                    key={i}
                    className={({ active }) =>
                      `relative cursor-default select-none px-4 py-2 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={item.value}
                  >
                    <span className="block truncate  font-normal ">
                      {item.label}
                    </span>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};
