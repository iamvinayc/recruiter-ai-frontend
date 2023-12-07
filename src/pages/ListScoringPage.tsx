// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

import { axiosApi } from "@/api/api";
import { ChipGroup } from "@/components/common/ChipGroup";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import { LineClamp } from "@/components/LineClamp";
import { PopupDialog } from "@/components/PopupDialog";
import { ROUTES } from "@/routes/routes";
import { cn, emptyArray } from "@/utils";
import { SkillLocationFilter } from "./common/SkillLocationFilter";

interface ScoringItem {
  id: number;
  job_title: string;
  candidate_name: string;
  profile_score: string;
  questionnaire_score: string;
  reason: string;
  summary: string;
}
const columnHelper = createColumnHelper<ScoringItem>();

export function ListScoringPage() {
  const [showDetailsId, setShowDetailsId] = useState<number | null>(null);
  const [{ skill: department, location }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_SCORING,
  );

  //#region list query
  const listScoringListQuery = useQuery({
    queryKey: ["listScoringListQuery", department, location],
    queryFn: () => {
      console.log("department, location", department, location);
      return axiosApi({
        url: "onboarding/scoring/",
        method: "GET",
        params: {
          department,
          location,
        },
      }).then((e) => e.data.data);
    },
  });

  //#endregion
  //#region memo states
  const columns = useMemo(
    () => [
      columnHelper.accessor("job_title", {
        header: "Job Title",
        cell: (info) => (
          <div className="max-w-[150px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("candidate_name", {
        header: "Candidate Name",
        cell: (info) => (
          <div className="max-w-[150px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("profile_score", {
        header: "Profile Score",
        cell: (info) => (
          <div className="max-w-[50px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("questionnaire_score", {
        header: "Questionnaire Score",
        cell: (info) => (
          <div className="max-w-[50px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("reason", {
        header: "Reason",
        cell: (info) => {
          return (
            <div className="max-w-[150px] truncate">{info.getValue()}</div>
          );
        },
      }),
      columnHelper.accessor("summary", {
        header: "Summary",
        cell: (info) => {
          return (
            <div className="max-w-[150px] truncate">{info.getValue()}</div>
          );
        },
      }),
      //   columnHelper.display({
      //     header: "Action",
      //     id: "action",
      //     cell: (info) => {
      //       return (
      //         <div className="flex items-center space-x-2">
      //           <button
      //             onClick={() => setShowDetailsId(info.row.original.id)}
      //             className="rounded-md bg-primary p-3 text-white hover:bg-opacity-70"
      //           >
      //             <EyeIcon className="h-5 w-5 " />
      //           </button>
      //         </div>
      //       );
      //     },
      //   }),
    ],
    [],
  );

  const scoringList = useMemo(
    () =>
      listScoringListQuery.data?.map<ScoringItem>((e) => ({
        id: e.id,
        job_title: e.job.title,
        candidate_name: e.candidate.name,
        profile_score: e.profile_score,
        questionnaire_score: e.questionnaire_score,
        reason: e.reasons || "",
        summary: e.symmary || "",
      })) || emptyArray,
    [listScoringListQuery.data],
  );

  //#endregion
  const selectedItem = listScoringListQuery.data?.find(
    (e) => e?.id === showDetailsId,
  );
  const table = useReactTable({
    columns: columns,
    data: scoringList,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          List Scoring
        </h2>
      </div>
      <SkillLocationFilter
        onSearch={() => {
          listScoringListQuery.refetch();
        }}
      />
      <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
        <div
          className={cn(
            "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
            listScoringListQuery.isLoading && "min-h-[20rem]",
          )}
        >
          <table className={cn("min-w-full   table-fixed overflow-scroll")}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className={cn(
                        "border-b border-slate-200 p-4 pb-3 pl-8  text-left font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200",
                        header.id === "platform" && "w-[140px]",
                        header.id === "action" && "w-[140px]",
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="relative">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="border-b border-slate-200 p-4 pl-8 text-slate-500 dark:border-slate-600 dark:text-slate-400"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!listScoringListQuery.isLoading && scoringList?.length === 0 && (
            <div
              className={cn(
                "h-[20rem]",
                "flex w-full items-center justify-center",
              )}
            >
              No Data
            </div>
          )}
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-full items-center justify-center bg-white bg-opacity-50",

              listScoringListQuery.isLoading ||
                listScoringListQuery.isRefetching
                ? "flex"
                : "hidden",
            )}
          >
            <SpinnerIcon className="h-6 w-6 text-black" />
          </div>
        </div>
      </div>
      <PopupDialog
        isOpen={showDetailsId !== null}
        setIsOpen={() => setShowDetailsId(null)}
        title="Job Details"
        containerClassName="max-w-[95%] md:max-w-[70%] "
      >
        <div>
          <button
            className="absolute right-0 top-0 p-4"
            onClick={() => setShowDetailsId(null)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div className="mt-4 grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-2">
            <div className="space-y-4">
              {(
                [
                  ["Job Title", selectedItem?.candidate_name],
                  ["Location", selectedItem?.candidate_location],
                ] as const
              ).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium">{key}</div>
                  <div className="text-sm text-slate-700">{value}</div>
                </div>
              ))}
              <div className="space-y-1">
                <div className="font-medium">Skills</div>
                <div className="text-sm ">
                  <ChipGroup
                    items={selectedItem?.job_departments || emptyArray}
                    showAll
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Description</div>
                <div className="text-sm text-slate-700">
                  <LineClamp text={selectedItem?.job?.description || ""} />
                </div>
              </div>
            </div>
            <div className=" ">
              <div>
                <div className="rounded-md border">
                  <div className="flex items-center space-x-2 border-b p-4 py-3 text-lg font-medium">
                    {/* icon */}
                    <span>Employer Info</span>
                  </div>
                  <div className="divide-y">
                    {[
                      [
                        "Employee Name",
                        selectedItem?.job?.employer?.employer_label,
                      ],
                      ["Email", selectedItem?.job?.employer?.email],
                      ["Phone 1", selectedItem?.job?.employer?.phone1],
                      ["Phone 2", selectedItem?.job?.employer?.phone2],
                    ].map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between px-4 py-2 text-sm"
                      >
                        <div className="font-medium">{key}</div>
                        <div>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopupDialog>
    </div>
  );
}
