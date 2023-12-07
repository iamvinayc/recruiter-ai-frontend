import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

import { axiosApi } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { ROUTES } from "@/routes/routes";

dayjs.extend(customParseFormat);

export function SkillLocationFilter({ onSearch }: { onSearch: VoidFunction }) {
  const [{ skill: department, location }, setTypedParams] =
    useTypedSearchParams(ROUTES.ADMIN.LIST_SCORING);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  // console.log("department", department, location);
  useEffect(() => {
    setSelectedDepartment(department);
  }, [department]);
  useEffect(() => {
    setSelectedLocation(location);
  }, [location]);

  const departmentListQuery = useQuery({
    queryKey: ["AdminListDepartmentPage"],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/department/",
        method: "GET",
        params: { type: 1 },
      })
        .then((e) => e.data.data)
        .then((e) => e.map((e) => ({ value: e.name, label: e.name }))),
  });
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
        <h2 className="text-xl font-bold text-stone-700">Apply filters</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Combobox
            label="Skill"
            items={departmentListQuery.data || []}
            selectedValue={selectedDepartment}
            setSelectedValue={setSelectedDepartment}
          />
          <Combobox
            label="Location"
            items={locationListQuery.data || []}
            selectedValue={selectedLocation}
            setSelectedValue={setSelectedLocation}
          />
        </div>

        <div className="mt-6 grid w-full grid-cols-2 justify-end space-x-4 md:flex">
          <button
            onClick={() => {
              setTypedParams({
                skill: "",
                location: "",
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
              });
            }}
            className="rounded-lg bg-blue-600 px-8 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
          >
            Apply filter
          </button>
        </div>
      </div>
    </div>
  );
}
