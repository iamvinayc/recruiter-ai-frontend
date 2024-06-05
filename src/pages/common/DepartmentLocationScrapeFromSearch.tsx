import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

import { axiosApi } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { SkillSelector } from "@/components/SkillSelector";
import { Input } from "@/components/common/Input";
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
      <div className="border-gray-200 dark:border-strokedark rounded-sm border border-stroke bg-white p-4 shadow-default">
        <h2 className="text-xl font-bold text-stone-700">Apply Filter</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <SkillSelector
            selectedItem={selectedDepartment}
            setSelectedItem={setSelectedDepartment}
          />
          <Combobox
            label="Location"
            items={locationListQuery.data || []}
            selectedValue={selectedLocation}
            setSelectedValue={setSelectedLocation}
          />

          <Input
            label="Scrapped From"
            type="date"
            value={
              selectedScrapeForm
                ? dayjs(selectedScrapeForm, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedScrapeForm
            }
            onChange={(e) => {
              setSelectedScrapeForm(
                dayjs(e.currentTarget.value).format("DD-MM-YYYY"),
              );
            }}
          />
          <Input
            label="Scrapped To"
            type="date"
            min={
              selectedScrapeForm
                ? dayjs(selectedScrapeForm, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedScrapeForm
            }
            value={
              selectedScrapeTo
                ? dayjs(selectedScrapeTo, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedScrapeTo
            }
            onChange={(e) => {
              setSelectedScrapeTo(
                dayjs(e.currentTarget.value).format("DD-MM-YYYY"),
              );
            }}
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
        </div>

        <div className="mt-6 grid w-full grid-cols-2 justify-end space-x-4 md:flex">
          <button
            onClick={() => {
              setTypedParams({
                skill: "",
                location: "",
                scrape_from: "",
                scrape_to: "",
                search: "",
              });
            }}
            className="bg-gray-200 text-gray-600 rounded-lg px-8 py-2 font-medium outline-none hover:opacity-90 focus:ring active:scale-95"
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
            className="rounded-lg bg-green-500 px-8 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
          >
            Start Scrape
          </button>
        </div>
      </div>
    </div>
  );
}
