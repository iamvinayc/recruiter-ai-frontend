import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { axiosApi } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { Input } from "@/components/common/Input";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { MultipleSkillSelector } from "@/components/MultipleSkillSelecter";
import { SectorSelector } from "@/components/SectorSelector";
import {
  useDebouncedSearchParam,
  useIsFilterApplied,
} from "@/hooks/useDebouncedSearchParam";
import { ROUTES } from "@/routes/routes";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

dayjs.extend(customParseFormat);

export function DepartmentLocationScrapeFromSearch({
  searchTitle,
}: {
  onSearch: VoidFunction;
  searchTitle: string;
}) {
  const [, setSearchParams] = useTypedSearchParams(ROUTES.ADMIN.LIST_JOBS);
  const [selectedLocation, setSelectedLocation] = useDebouncedSearchParam(
    ROUTES.ADMIN.LIST_JOBS,
    "location",
  );

  const [selectedDepartment, setSelectedDepartment] = useDebouncedSearchParam(
    ROUTES.ADMIN.LIST_JOBS,
    "skill",
  );
  const [selectedScrapeForm, setSelectedScrapeForm] = useDebouncedSearchParam(
    ROUTES.ADMIN.LIST_JOBS,
    "scrape_from",
  );
  const [selectedScrapeTo, setSelectedScrapeTo] = useDebouncedSearchParam(
    ROUTES.ADMIN.LIST_JOBS,
    "scrape_to",
  );
  const [selectedSearch, setSelectedSearch] = useDebouncedSearchParam(
    ROUTES.ADMIN.LIST_JOBS,
    "search",
  );
  const [selectedSector, setSelectedSector] = useDebouncedSearchParam(
    ROUTES.ADMIN.LIST_JOBS,
    "sector",
  );
  const isFilterApplied = useIsFilterApplied(ROUTES.ADMIN.LIST_JOBS, [
    "skill",
    "location",
    "scrape_from",
    "scrape_to",
    "search",
    "id",
    "sector",
  ]);
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
  const reset = () => {
    setSearchParams({});
  };
  return (
    <div className="mb-2">
      <div className=" dark:border-strokedark rounded-sm border border-sky-300 bg-white p-4 shadow-default">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold uppercase text-stone-700">
            Filters
          </h2>
          {isFilterApplied && (
            <span
              className="cursor-pointer text-sm text-blue-500 underline"
              onClick={reset}
            >
              Clear Filter
            </span>
          )}
        </div>
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
          <SectorSelector
            labelClassName="mt-0"
            className="py-[2px]"
            selectedItem={selectedSector}
            setSelectedItem={setSelectedSector}
          />
        </div>
      </div>
    </div>
  );
}
