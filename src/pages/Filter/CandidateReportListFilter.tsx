import { sectorsMap } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { Button } from "@/components/common/Button";
import { DebouncedSearchInput } from "@/components/common/Input";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { LocationSelector } from "@/components/LocationSelector";
import { MultipleSkillSelector } from "@/components/MultipleSkillSelecter";
import {
  useDebouncedSearchParam,
  useIsFilterApplied,
} from "@/hooks/useDebouncedSearchParam";
import { ROUTES } from "@/routes/routes";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

dayjs.extend(customParseFormat);

export function CandidateReportListFilter({
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
  const [, setTypedParams] = useTypedSearchParams(
    ROUTES.ADMIN.CANDIDATE_REPORT,
  );
  const [selectedLocation, setSelectedLocation] = useDebouncedSearchParam(
    ROUTES.ADMIN.CANDIDATE_REPORT,
    "location",
  );
  const [selectedFromDate, setSelectedFromDate] = useDebouncedSearchParam(
    ROUTES.ADMIN.CANDIDATE_REPORT,
    "from_date",
  );
  const [selectedToDate, setSelectedToDate] = useDebouncedSearchParam(
    ROUTES.ADMIN.CANDIDATE_REPORT,
    "to_date",
  );
  const [selectedSector, setSelectedSector] = useDebouncedSearchParam(
    ROUTES.ADMIN.CANDIDATE_REPORT,
    "sector",
  );
  const [selectedDepartment, setSelectedDepartment] = useDebouncedSearchParam(
    ROUTES.ADMIN.CANDIDATE_REPORT,
    "skill",
  );

  const isFilterApplied = useIsFilterApplied(ROUTES.ADMIN.CANDIDATE_REPORT, [
    "skill",
    "location",
    "sector",
    "from_date",
    "to_date",
  ]);
  const reset = () => {
    setTypedParams({});
  };
  return (
    <div className="mb-2">
      <div className="dark:border-strokedark rounded-sm border border-sky-300 bg-white p-4 shadow-default ">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold uppercase text-stone-700">Filter</h2>
          {isFilterApplied && (
            <span
              className="cursor-pointer text-sm text-blue-500 underline"
              onClick={reset}
            >
              Clear Filter
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <DatePickerWithRange
            title="Date Range"
            selectedFromDate={selectedFromDate}
            selectedToDate={selectedToDate}
            setSelectedFromDate={setSelectedFromDate}
            setSelectedToDate={setSelectedToDate}
            className="h-11 "
          />
          <Combobox
            className=" h-[40px] "
            parentClassName=""
            label="Sector"
            items={sectorsMap}
            selectedValue={selectedSector}
            setSelectedValue={setSelectedSector}
          />
          <LocationSelector
            selected={{ name: selectedLocation }}
            setSelected={(e) => setSelectedLocation(e.name)}
          />
          <MultipleSkillSelector
            className=""
            selectedItems={selectedDepartment}
            setSelectedItems={setSelectedDepartment}
          />
          <div className="h-full w-full ">
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
        </div>
        {isEmpty ? null : (
          <div className="mt-2 flex items-end justify-end gap-2 lg:col-span-4">
            <Button
              className="rounded-none bg-success py-2 text-center"
              isLoading={isLoading}
              onClick={onClick}
            >
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
