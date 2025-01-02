import { sectorsMap } from "@/api/api";
import { Combobox } from "@/components/Combobox";
import { Button } from "@/components/common/Button";
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

export function EmployerReportListFilter({
  isLoading,
  onClick,
  isEmpty,
}: {
  onSearch: VoidFunction;
  isLoading?: boolean;
  onClick?: () => void;
  isEmpty?: boolean;
}) {
  const [, setTypedParams] = useTypedSearchParams(ROUTES.ADMIN.EMPLOYER_REPORT);
  const [selectedLocation, setSelectedLocation] = useDebouncedSearchParam(
    ROUTES.ADMIN.EMPLOYER_REPORT,
    "location",
  );
  const [selectedFromDate, setSelectedFromDate] = useDebouncedSearchParam(
    ROUTES.ADMIN.EMPLOYER_REPORT,
    "from_date",
  );
  const [selectedToDate, setSelectedToDate] = useDebouncedSearchParam(
    ROUTES.ADMIN.EMPLOYER_REPORT,
    "to_date",
  );
  const [selectedSector, setSelectedSector] = useDebouncedSearchParam(
    ROUTES.ADMIN.EMPLOYER_REPORT,
    "sector",
  );
  const [selectedDepartment, setSelectedDepartment] = useDebouncedSearchParam(
    ROUTES.ADMIN.EMPLOYER_REPORT,
    "skill",
  );

  const isFilterApplied = useIsFilterApplied(ROUTES.ADMIN.EMPLOYER_REPORT, [
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
      <div className="dark:border-strokedark space-y-4 rounded-sm border border-sky-300 bg-white p-4 shadow-default">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <DatePickerWithRange
            title="Date Range"
            className=""
            selectedFromDate={selectedFromDate}
            selectedToDate={selectedToDate}
            setSelectedFromDate={setSelectedFromDate}
            setSelectedToDate={setSelectedToDate}
          />
          <Combobox
            className="h-[40px]"
            parentClassName=" "
            label="Sector"
            items={sectorsMap}
            selectedValue={selectedSector}
            setSelectedValue={setSelectedSector}
          />
          <LocationSelector
            className=""
            selected={{ name: selectedLocation }}
            setSelected={(e) => setSelectedLocation(e.name)}
          />
          <MultipleSkillSelector
            className=""
            selectedItems={selectedDepartment}
            setSelectedItems={setSelectedDepartment}
          />
          {isEmpty ? null : (
            <div className="flex items-end gap-4">
              <Button
                className="rounded-none bg-success px-1.5 py-2 text-center"
                isLoading={isLoading}
                onClick={onClick}
              >
                Download
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
