import { OnboardingStatus, axiosApi } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/routes/routes";
import { convertEnumToStr } from "@/utils";
import { Combobox as HUICombobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ElementRef, Fragment, useEffect, useRef, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import { useDebounce } from "usehooks-ts";

dayjs.extend(customParseFormat);

export function ReportListFilter({ onSearch }: { onSearch: VoidFunction }) {
  const [
    { from_date, status, to_date, employer, employer_name },
    setTypedParams,
  ] = useTypedSearchParams(ROUTES.ADMIN.LIST_REPORT);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState("");
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [selectedEmployerName, setSelectedEmployerName] =
    useState<ListItem | null>(null);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);
  useEffect(() => {
    setSelectedFromDate(from_date);
  }, [from_date]);
  useEffect(() => {
    setSelectedToDate(to_date);
  }, [to_date]);
  useEffect(() => {
    setSelectedEmployer(employer);
  }, [employer]);
  useEffect(() => {
    if (employer) {
      setSelectedEmployerName({
        label: employer_name,
        value: employer,
      });
    }
  }, [employer_name, employer]);

  const isNotDirty =
    status === selectedStatus &&
    from_date == selectedFromDate &&
    to_date == selectedToDate &&
    employer == selectedEmployer;
  const isDirty = !isNotDirty;
  const isAllEmpty =
    [
      status,
      from_date,
      to_date,
      employer,
      selectedEmployer,
      selectedFromDate,
      selectedToDate,
      selectedStatus,
    ].filter(Boolean).length == 0;

  return (
    <div className="mb-2">
      <div className="border-gray-200 dark:border-strokedark rounded-sm border border-stroke bg-white p-4 shadow-default">
        <h2 className="text-xl font-bold text-stone-700">Apply filters</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Example
            selectedEmployer={selectedEmployerName}
            setSelectedEmployer={(e) => {
              console.log("e", e);
              setSelectedEmployerName(e);
              if (e) setSelectedEmployer(e.value);
            }}
          />
          {/* <Combobox
            label="Employer"
            items={employerList}
            selectedValue={selectedEmployer}
            setSelectedValue={setSelectedEmployer}
            filter={(value, search) => {
              // const label = employerList.find((e) => e.value === value)?.label;
              // if (
              //   label
              //     ?.toLocaleLowerCase()
              //     ?.includes(search?.toLocaleLowerCase()?.trim())
              // )
              return 1;
              return 0;
            }}
          /> */}
          <Combobox
            label="Status"
            items={Object.entries(OnboardingStatus).map(([key, value]) => ({
              label: convertEnumToStr(key),
              value: value,
            }))}
            selectedValue={selectedStatus}
            setSelectedValue={setSelectedStatus}
          />
          <Input
            label="From Date"
            type="date"
            value={
              selectedFromDate
                ? dayjs(selectedFromDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedFromDate
            }
            onChange={(e) => {
              setSelectedFromDate(
                dayjs(e.currentTarget.value).format("DD-MM-YYYY"),
              );
            }}
          />
          <Input
            label="To Date"
            type="date"
            value={
              selectedToDate
                ? dayjs(selectedToDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedToDate
            }
            min={
              selectedFromDate
                ? dayjs(selectedFromDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedFromDate
            }
            onChange={(e) => {
              setSelectedToDate(
                dayjs(e.currentTarget.value).format("DD-MM-YYYY"),
              );
            }}
          />
        </div>

        <div className="mt-6 grid w-full grid-cols-2 justify-end space-x-4 md:flex">
          {isAllEmpty ? null : (
            <button
              onClick={() => {
                setTypedParams({
                  from_date: "",
                  status: "",
                  to_date: "",
                });
              }}
              className="rounded-lg bg-slate-200 px-8 py-2 font-medium text-slate-600 outline-none hover:opacity-90 focus:ring active:scale-95"
            >
              Reset
            </button>
          )}
          {isDirty ? (
            <>
              <button
                onClick={() => {
                  if (isNotDirty) {
                    onSearch();
                  }
                  setTypedParams({
                    from_date: selectedFromDate,
                    to_date: selectedToDate,
                    status: selectedStatus,
                    employer: selectedEmployer,
                    employer_name: selectedEmployerName?.label,
                  });
                }}
                className="rounded-lg bg-blue-600 px-8 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
              >
                Apply filter
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface ListItem {
  value: string;
  label: string;
}
function Example({
  selectedEmployer,
  setSelectedEmployer,
}: {
  selectedEmployer: ListItem | null;
  setSelectedEmployer: (e: ListItem | null) => void;
}) {
  const [selected, setSelected] = useState<null | ListItem>();
  const [query, setQuery] = useState("");
  const searchQuery = useDebounce(query, 500);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [isFetching, setIsLoading] = useState(false);

  useEffect(() => {
     setIsLoading(true);
    axiosApi({
      url: "data-sourcing/employer/",
      method: "GET",
      params: {
        per_page: 15,
        name: searchQuery,
      },
    })
      .then((e) => e.data?.data)
      .then((e) =>
        Array.isArray(e)
          ? e.map<ListItem>((e) => ({
              label: e.employer_label,
              value: e.id.toString(),
            }))
          : [],
      )
      .then((e) => {
        setListItems(e);
      })
      .finally(() => setIsLoading(false));
  }, [searchQuery]);
  useEffect(() => {
    if (selected) setSelectedEmployer(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  useEffect(() => {
    setSelected(selectedEmployer);
  }, [selectedEmployer]);

  const btnRef = useRef<ElementRef<"button">>(null);
  return (
    <div className=" ">
      <HUICombobox
        value={selected}
        onChange={(e) => {
          setSelected(e);
          setSelectedEmployer(e);
        }}
      >
        {({ open }) => (
          <>
            <div className="relative ">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Employer
              </label>
              <div className="relative w-full cursor-default overflow-hidden rounded-lg border bg-white text-left  sm:text-sm">
                <HUICombobox.Input
                  className="text-gray-900 w-full  py-2 pl-3 pr-10 text-sm leading-5 "
                  placeholder="Search Employer"
                  displayValue={(person: { label: string }) => person?.label}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                  onClick={() => {
                    if (!open) btnRef.current?.click();
                  }}
                />
                <HUICombobox.Button
                  ref={btnRef}
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                >
                  {isFetching ? (
                    <SpinnerIcon className="m-0 text-primary" />
                  ) : (
                    <ChevronUpDownIcon
                      className="text-gray-400 h-5 w-5"
                      aria-hidden="true"
                      onClick={() => true}
                    />
                  )}
                </HUICombobox.Button>
              </div>
              {open ? (
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setQuery("")}
                >
                  <HUICombobox.Options
                    static={open}
                    className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                  >
                    {listItems.length === 0 && query !== "" && !isFetching ? (
                      <div className="text-gray-700 relative cursor-default select-none px-4 py-2">
                        Not found.
                      </div>
                    ) : (
                      listItems.map((item) => (
                        <HUICombobox.Option
                          key={item.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-teal-600 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={item}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {item.label}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? "text-white" : "text-teal-600"
                                  }`}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </HUICombobox.Option>
                      ))
                    )}
                  </HUICombobox.Options>
                </Transition>
              ) : null}
            </div>
          </>
        )}
      </HUICombobox>
    </div>
  );
}
