import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

import { axiosApi } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { Input } from "@/components/common/Input";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { MultipleSkillSelector } from "@/components/MultipleSkillSelecter";
import { ROUTES } from "@/routes/routes";

dayjs.extend(customParseFormat);

export function DepartmentLocationScrapeFromSearch({
  onSearch,
  searchTitle,
}: {
  onSearch: VoidFunction;
  searchTitle: string;
}) {
  const [
    { skill: department, location, scrape_from, scrape_to, search },
    setTypedParams,
  ] = useTypedSearchParams(ROUTES.ADMIN.LIST_JOBS);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedScrapeForm, setSelectedScrapeForm] = useState("");
  const [selectedScrapeTo, setSelectedScrapeTo] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  // console.log("department", department, location);
  useEffect(() => {
    setSelectedDepartment(department);
  }, [department]);
  useEffect(() => {
    setSelectedLocation(location);
  }, [location]);
  useEffect(() => {
    setSelectedScrapeForm(scrape_from);
  }, [scrape_from]);
  useEffect(() => {
    setSelectedScrapeTo(scrape_to);
  }, [scrape_to]);
  useEffect(() => {
    setSelectedSearch(search);
  }, [search]);

  const locationListQuery = useQuery({
    queryKey: ["AdminListLocationPage"],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/location/",
        method: "GET",
      }).then((e) => e.data.data),
    select(data) {
      return data.map((e) => ({ value: e.name, label: e.name }));
    },
  });

  return (
    <div className="mb-2">
      <div className=" dark:border-strokedark rounded-sm border border-sky-300 bg-white p-4 shadow-default">
        <h2 className="text-xl font-bold uppercase text-stone-700">Filters</h2>
        <div className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* <SkillSelector
            selectedItem={selectedDepartment}
            setSelectedItem={setSelectedDepartment}
          /> */}
          <MultipleSkillSelector
            selectedItems={selectedDepartment}
            setSelectedItems={setSelectedDepartment}
          />
          <Combobox
            className="h-[40px]"
            label="Location"
            items={locationListQuery.data || []}
            selectedValue={selectedLocation}
            setSelectedValue={setSelectedLocation}
          />

          <DatePickerWithRange
            title="Scraped Date Range"
            selectedFromDate={selectedScrapeForm}
            selectedToDate={selectedScrapeTo}
            setSelectedFromDate={setSelectedScrapeForm}
            setSelectedToDate={setSelectedScrapeTo}
          />
          <Input
            label={searchTitle}
            placeholder={searchTitle}
            type="text"
            value={selectedSearch}
            onChange={(e) => {
              setSelectedSearch(e.currentTarget.value);
            }}
          />
          <div className="flex  flex-nowrap items-end gap-2">
            <button
              onClick={() => {
                setTypedParams({
                  skill: "",
                  location: "",
                  scrape_from: "",
                  scrape_to: "",
                  search: "",
                });
                setSelectedDepartment("");
              }}
              className="rounded-none bg-red-600 px-4 py-2 font-medium text-white hover:opacity-90 focus:ring active:scale-95"
            >
              Reset
            </button>
            <button
              onClick={() => {
                if (
                  department === selectedDepartment &&
                  location == selectedLocation
                ) {
                  onSearch();
                }
                setTypedParams({
                  skill: selectedDepartment,
                  location: selectedLocation,
                  scrape_from: selectedScrapeForm,
                  scrape_to: selectedScrapeTo,
                  search: selectedSearch,
                });
              }}
              className="rounded-none bg-green-500 px-2 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
            >
              Start Scrape
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
