import { sectorsMap } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { Button } from "@/components/common/Button";
import { DebouncedSearchInput } from "@/components/common/Input";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import {
  LocationSelector,
  Item as LocationType,
} from "@/components/LocationSelector";
import { MultipleSkillSelector } from "@/components/MultipleSkillSelecter";
import { ROUTES } from "@/routes/routes";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

dayjs.extend(customParseFormat);

export function CandidateReportListFilter({
  onSearch,
  isLoading,
  onClick,
  isEmpty,
  candidate,
  setCandidate,
}: {
  onSearch: VoidFunction;
  isLoading?: boolean;
  onClick?: () => void;
  isEmpty?: boolean;
  candidate: string;
  setCandidate: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [
    { location, from_date, to_date, sector, skill: department },
    setTypedParams,
  ] = useTypedSearchParams(ROUTES.ADMIN.CANDIDATE_REPORT);
  const [selectedLocation, setSelectedLocation] = useState<LocationType>({
    name: "",
  });
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  useState<ListItem | null>(null);

  useEffect(() => {
    setSelectedLocation(location ? { name: location } : { name: "" });
  }, [location]);
  useEffect(() => {
    setSelectedFromDate(from_date);
  }, [from_date]);
  useEffect(() => {
    setSelectedToDate(to_date);
  }, [to_date]);
  useEffect(() => {
    setSelectedSector(sector);
  }, [sector]);
  useEffect(() => {
    setSelectedDepartment(department);
  }, [department]);

  const isNotDirty =
    department == selectedDepartment &&
    location == selectedLocation.name &&
    from_date == selectedFromDate &&
    to_date == selectedToDate &&
    sector == selectedSector;
  const isDirty = !isNotDirty;
  const isAllEmpty =
    [
      department,
      location,
      from_date,
      to_date,
      sector,
      selectedDepartment,
      selectedLocation.name,
      selectedFromDate,
      selectedToDate,
      selectedSector,
    ].filter(Boolean).length == 0;

  return (
    <div className="mb-2">
      <div className="dark:border-strokedark rounded-sm border border-sky-300 bg-white p-4 shadow-default">
        <h2 className="text-xl font-bold uppercase text-stone-700">Filter</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8">
          <DatePickerWithRange
            title="Date Range"
            selectedFromDate={selectedFromDate}
            selectedToDate={selectedToDate}
            setSelectedFromDate={setSelectedFromDate}
            setSelectedToDate={setSelectedToDate}
            className="h-11 lg:col-span-2"
          />
          <Combobox
            className=" h-[44.7px]"
            parentClassName="lg:col-span-2"
            label="Sector"
            items={sectorsMap}
            selectedValue={selectedSector}
            setSelectedValue={setSelectedSector}
          />
          <LocationSelector
            className="lg:col-span-2"
            selected={selectedLocation}
            setSelected={setSelectedLocation}
          />
          <MultipleSkillSelector
            className="lg:col-span-2"
            selectedItems={selectedDepartment}
            setSelectedItems={setSelectedDepartment}
          />
          <div className="h-full w-full lg:col-span-2">
            <label className="mb-2.5 ml-4 block font-medium text-black dark:text-white">
              Candidate Name
            </label>
            <DebouncedSearchInput
              placeholder="Search by Candidate Name"
              value={candidate}
              onChange={(val) => {
                setCandidate("" + val);
              }}
              className="w-full flex-1 py-1"
              parentClassName="py-1 w-full"
            />
          </div>
          {isEmpty ? null : (
            <div className="flex items-end gap-2 lg:col-span-4">
              <Button
                className="rounded-none bg-success py-2 text-center"
                isLoading={isLoading}
                onClick={onClick}
              >
                Download
              </Button>
              {isAllEmpty ? null : (
                <button
                  onClick={() => {
                    location === "" &&
                    from_date === "" &&
                    to_date === "" &&
                    sector === "" &&
                    department === ""
                      ? (setSelectedLocation({ name: "" }),
                        setSelectedFromDate(""),
                        setSelectedToDate(""),
                        setSelectedSector(""),
                        setSelectedDepartment(""))
                      : setTypedParams({
                          location: "",
                          from_date: "",
                          to_date: "",
                          sector: "",
                          skill: "",
                        });
                  }}
                  className="rounded-none bg-red-600 px-6 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
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
                        location: selectedLocation.name,
                        from_date: selectedFromDate,
                        to_date: selectedToDate,
                        sector: selectedSector,
                        skill: selectedDepartment,
                      });
                    }}
                    className="rounded-none bg-blue-600 px-8 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
                  >
                    Apply Filter
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ListItem {
  value: string;
  label: string;
}
