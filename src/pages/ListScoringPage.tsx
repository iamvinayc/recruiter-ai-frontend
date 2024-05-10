import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronRight, EyeIcon, PencilIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

import { axiosApi } from "@/api/api";
import { LineClamp } from "@/components/LineClamp";
import { PopupDialog } from "@/components/PopupDialog";
import { ReasonRenderer } from "@/components/ReasonRenderer";
import { ChipGroup } from "@/components/common/ChipGroup";
import {
  DebouncedInput,
  DebouncedSearchInput,
} from "@/components/common/Input";
import { ROUTES } from "@/routes/routes";
import { cn, emptyArray, replaceWith } from "@/utils";
import { Switch } from "@headlessui/react";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const jobColumnHelper = createColumnHelper<ScoringJobItem>();
const candidateColumnHelper = createColumnHelper<ScoringCandidateItem>();

export function ListScoringPage() {
  const [isEmployerNotified, setIsEmployerNotified] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [searchCandidateName, setSearchCandidateName] = useState("");
  const [searchCandidateEmail, setSearchCandidateEmail] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null,
  );
  const [{ skill: department, location }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_SCORING,
  );
  const [search, setSearch] = useState("");
  //#region list query
  const listJobQuery = useInfiniteQuery({
    queryKey: ["listScoringListQuery", department, location, search],
    queryFn: ({ pageParam }) => {
      console.log("department, location, search", department, location);
      return axiosApi({
        url: replaceWith("onboarding/scored_jobs/", pageParam),
        method: "GET",
        params: {
          search,
        },
        // params: {
        //   department,
        //   location,
        // },
      }).then((e) => e.data);
    },
    getNextPageParam(e) {
      return e.next;
    },
    initialPageParam: "",
  });

  const listCandidateBasedOnJobQuery = useInfiniteQuery({
    queryKey: [
      "listCandidateBasedOnJobQuery",
      selectedJobId,
      isEmployerNotified,
      searchCandidateName,
      searchCandidateEmail,
      department,
      location,
    ],
    enabled: !!selectedJobId,
    queryFn: ({ pageParam }) => {
      return axiosApi({
        url: replaceWith("onboarding/candidates_score/", pageParam),
        method: "GET",
        params: {
          department,
          location,
          job_id: `${selectedJobId}`,
          is_employer_notified: isEmployerNotified ? true : undefined,
          name: searchCandidateName,
          email: searchCandidateEmail,
        },
      }).then((e) => e.data);
    },
    getNextPageParam(e) {
      return e.next;
    },
    initialPageParam: "",
  });

  //#endregion
  //#region memo states
  const jobListColumns = useMemo(
    () => [
      jobColumnHelper.display({
        id: "SLNo",
        header: "Sr. No",
        cell: (info) => info.row.index + 1,
      }),
      jobColumnHelper.accessor("job_title", {
        header: () => <div>Job Title</div>,
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      jobColumnHelper.accessor("job_location", {
        header: "Location",
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      jobColumnHelper.accessor("department", {
        header: "Department",
        cell: (info) => (
          <div>
            <ChipGroup items={info.getValue() || []} />
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      jobColumnHelper.display({
        header: "Action",
        id: "action",
        cell: (info) => {
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedJobId(info.row.original.job_id)}
                className="flex items-center rounded-md bg-primary p-3 text-sm text-white hover:bg-opacity-80"
              >
                {/* <span>View matching candidates</span> */}
                <ChevronRight className="h-5 w-5 " />
              </button>
            </div>
          );
        },
      }),
    ],
    [search],
  );
  const candidateListColumns = useMemo(
    () => [
      candidateColumnHelper.display({
        id: "SLNo",
        header: "Sr. No",
        cell: (info) => info.row.index + 1,
      }),
      candidateColumnHelper.accessor("candidate_name", {
        header: () => (
          <div>
            <div>Candidate Name</div>
            <DebouncedInput
              className="mt-2 border border-slate-200 px-2 py-1 text-xs shadow-sm"
              type="text"
              placeholder="Search"
              value={searchCandidateName}
              onChange={(val) => {
                setSearchCandidateName("" + val);
              }}
            />
          </div>
        ),
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("candidate_email", {
        header: () => (
          <div>
            <div>Candidate Email</div>
            <DebouncedInput
              className="mt-2 border border-slate-200 px-2 py-1 text-xs shadow-sm"
              type="text"
              placeholder="Search"
              value={searchCandidateEmail}
              onChange={(val) => {
                setSearchCandidateEmail("" + val);
              }}
            />
          </div>
        ),
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("profile_score", {
        header: "Profile Score",
        cell: (info) => <div>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("overall_score", {
        header: "Overall Score",
        cell: (info) => <div>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      // candidateColumnHelper.accessor("summary", {
      //   header: "Summary",
      //   cell: (info) => (
      //     <div className="max-w-[150px] truncate">{info.getValue()}</div>
      //   ),
      //   footer: (info) => info.column.id,
      // }),
      // candidateColumnHelper.accessor("reasons", {
      //   header: "Reason",
      //   cell: (info) => (
      //     <div className="max-w-[150px] truncate">{info.getValue()}</div>
      //   ),
      //   footer: (info) => info.column.id,
      // }),
      candidateColumnHelper.accessor("is_employer_notified", {
        header: "Is Employer Notified",
        cell: (info) => (
          <div className="flex">
            <span
              className={cn(
                "relative grid select-none items-center whitespace-nowrap rounded-lg  px-3 py-1.5 font-sans text-xs font-bold text-white",
                info.getValue() ? "bg-green-500" : "bg-yellow-500",
              )}
            >
              {info.getValue() ? "Notified" : "Pending"}
            </span>
          </div>
        ),
      }),
      candidateColumnHelper.display({
        header: "Action",
        id: "action",
        cell: (info) => {
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setSelectedCandidateId(info.row.original.candidate_id)
                }
                className="flex items-center rounded-md bg-primary p-3 text-white hover:bg-opacity-80"
              >
                <EyeIcon className="h-5 w-5 " />
              </button>
            </div>
          );
        },
      }),
    ],
    [searchCandidateEmail, searchCandidateName],
  );

  const listJobQueryData = useMemo(
    () => listJobQuery.data?.pages?.map((e) => e.data)?.flat() || emptyArray,
    [listJobQuery.data?.pages],
  );
  const jobList = useMemo(
    () =>
      listJobQueryData?.map<ScoringJobItem>((e) => ({
        job_id: e.id,
        job_title: e.title,
        department: e.departments,
        job_location: e.location.name,
      })) || emptyArray,
    [listJobQueryData],
  );
  const candidateListQueryData = useMemo(
    () =>
      listCandidateBasedOnJobQuery.data?.pages?.map((e) => e.data)?.flat() ||
      emptyArray,
    [listCandidateBasedOnJobQuery.data?.pages],
  );
  const candidateList = useMemo(
    () =>
      candidateListQueryData?.map<ScoringCandidateItem>((e) => ({
        candidate_id: e.candidate.id,
        candidate_email: e.candidate.email,
        candidate_name: e.candidate.name,
        profile_score: e.profile_score,
        overall_score: e.overall_score,
        reasons: e.reasons,
        summary: e.symmary,
        is_employer_notified: e.is_employer_notified,
      })) || emptyArray,
    [candidateListQueryData],
  );

  //#endregion
  // const selectedItem = listScoringListQuery.data?.find(
  //   (e) => e.job_id === showDetailsId,
  // );
  const jobTable = useReactTable({
    columns: jobListColumns,
    data: jobList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });
  const candidateTable = useReactTable({
    columns: candidateListColumns,
    data: candidateList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });
  const selectedJob = listJobQueryData?.find((e) => e.id == selectedJobId);

  const selectedUser = candidateListQueryData?.find(
    (e) => e.candidate.id == selectedCandidateId,
  );
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {selectedJobId ? "Candidate score list" : "Select a job"}
        </h2>
        {selectedJobId ? null : (
          <DebouncedSearchInput
            placeholder="Search by job title"
            value={search}
            onChange={(val) => {
              setSearch("" + val);
            }}
          />
        )}
      </div>
      {selectedJob ? (
        <div className="mb-2">
          <div className="border-gray-200 dark:border-strokedark rounded-sm border border-stroke bg-white p-4 shadow-default">
            {/* <h2 className="text-xl font-bold text-stone-700">Selected Job</h2> */}
            <div className="flex flex-wrap gap-x-12 gap-y-4">
              {[
                { title: "Job Title", value: selectedJob.title },
                { title: "Job Location", value: selectedJob.location.name },
              ].map(({ title, value }) => (
                <div key={title}>
                  <div className="font-medium">{title}:</div>
                  <div className="text-sm">{value}</div>
                </div>
              ))}
              <div>
                <div className="font-medium">Departments:</div>
                <div className="text-sm">
                  <ChipGroup items={selectedJob.departments} />
                </div>
              </div>
              <div>
                <div className="font-medium">Is Employer Notified:</div>

                <Switch
                  checked={isEmployerNotified}
                  onChange={setIsEmployerNotified}
                  className={`${
                    isEmployerNotified ? "bg-green-500" : "bg-slate-400"
                  }
                relative inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      isEmployerNotified ? "translate-x-6" : "translate-x-0"
                    }
                  pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
              {[
                {
                  title: "Employer Name",
                  value: selectedJob.employer.employer_label,
                },
                { title: "Employer Email", value: selectedJob.employer.email },
              ].map(({ title, value }) => (
                <div key={title}>
                  <div className="font-medium">{title}:</div>
                  <div className="text-sm">{value}</div>
                </div>
              ))}
            </div>
            {/* <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> */}
            {/* </div> */}
            <div className="mt-6 grid w-full grid-cols-2 justify-end space-x-4 md:flex">
              <button
                onClick={() => {
                  setSelectedJobId(null);
                }}
                className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Change Job</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
        {selectedJobId !== null ? null : (
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              listJobQuery.isLoading && "min-h-[20rem]",
              selectedJobId !== null && "hidden",
            )}
          >
            <InfinityLoaderComponent
              dataLength={jobList.length}
              hasMore={listJobQuery.hasNextPage}
              next={() => {
                listJobQuery.fetchNextPage();
              }}
            >
              <Table
                table={jobTable}
                loader={
                  <TableLoader
                    dataList={jobList}
                    isLoading={listJobQuery.isLoading}
                    isUpdateLoading={
                      listJobQuery.isLoading || listJobQuery.isRefetching
                    }
                  />
                }
              />
            </InfinityLoaderComponent>
          </div>
        )}

        <div
          className={cn(
            "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
            listJobQuery.isLoading && "min-h-[20rem]",
            selectedJobId === null && "hidden",
          )}
        >
          <InfinityLoaderComponent
            dataLength={candidateList.length}
            hasMore={listCandidateBasedOnJobQuery.hasNextPage}
            next={() => {
              listCandidateBasedOnJobQuery.fetchNextPage();
            }}
          >
            <Table
              table={candidateTable}
              loader={
                <TableLoader
                  dataList={candidateList}
                  isLoading={listCandidateBasedOnJobQuery.isLoading}
                  isUpdateLoading={
                    listCandidateBasedOnJobQuery.isLoading ||
                    listCandidateBasedOnJobQuery.isRefetching
                  }
                />
              }
            />
          </InfinityLoaderComponent>
        </div>
      </div>
      <PopupDialog
        isOpen={selectedCandidateId != null}
        setIsOpen={() => setSelectedCandidateId(null)}
        title="Candidate Details"
        showXMarkIcon
        containerClassName="max-w-[80%]"
      >
        <div>
          <div className="mt-4 grid max-h-[80vh] grid-cols-1 gap-x-12 gap-y-4 overflow-y-auto lg:grid-cols-2">
            <div className="space-y-2">
              <div className="rounded-md border">
                <div className="flex items-center space-x-2 border-b p-4 py-3 text-lg font-medium">
                  <span>User Info</span>
                </div>
                <div className="divide-y">
                  {[
                    ["Name", selectedUser?.candidate.name],
                    ["Email", selectedUser?.candidate.email],
                    ["Phone", selectedUser?.candidate?.phone],
                    ["Profile url", selectedUser?.candidate?.profile_url],
                    ["Resume file", selectedUser?.candidate?.resume_file],
                    ["Location", selectedUser?.candidate?.location?.name],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col justify-between px-4 py-2 text-sm md:flex-row"
                    >
                      <div className="font-medium">{key}</div>
                      {value?.startsWith("https://") ? (
                        <a
                          href={value}
                          rel="noopener noreferrer"
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="truncate text-blue-500"
                        >
                          {value}
                        </a>
                      ) : (
                        <div className="truncate ">{value}</div>
                      )}
                    </div>
                  ))}
                  <div className="space-y-1 px-4 py-2">
                    <div className="font-medium">Skills</div>
                    <div className="text-sm ">
                      <ChipGroup
                        items={
                          selectedUser?.candidate.departments || emptyArray
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1 px-4 py-2">
                    <div className="font-medium">Description</div>
                    <div className="text-sm text-slate-700">
                      <LineClamp
                        text={selectedUser?.candidate?.description || ""}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="flex items-center space-x-2 border-b p-4 py-3 text-lg font-medium">
                  {/* icon */}
                  <span>Scoring Info</span>
                </div>
                <div className="divide-y">
                  {[
                    ["Profile score", selectedUser?.profile_score],
                    ["Overall score", selectedUser?.overall_score],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col justify-between px-4 py-2 text-sm md:flex-row"
                    >
                      <div className="font-medium">{key}</div>
                      {value?.startsWith("https://") ? (
                        <a
                          href={value}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="truncate text-blue-500"
                          rel="noreferrer"
                        >
                          {value}
                        </a>
                      ) : (
                        <div className="truncate ">{value}</div>
                      )}
                    </div>
                  ))}

                  {(
                    [
                      ["Summary:", selectedUser?.symmary],
                      ["Reason:", selectedUser?.reasons],
                    ] as const
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col justify-between px-4 py-2 text-sm"
                    >
                      <div className="font-medium">{key}</div>
                      {Array.isArray(value) ? (
                        <ReasonRenderer reason={value} />
                      ) : (
                        <LineClamp text={value || ""} />
                      )}
                    </div>
                  ))}
                  <div className="flex flex-col justify-between px-4 py-2 text-sm">
                    <div className="font-medium">Is Employer Notified</div>
                    <div className="mt-2 flex">
                      <span
                        className={cn(
                          "whitespace-nowrap  rounded-lg  px-3 py-1.5 font-sans text-xs font-bold text-white",
                          selectedUser?.is_employer_notified
                            ? "bg-green-500"
                            : "bg-yellow-500",
                        )}
                      >
                        {selectedUser?.is_employer_notified
                          ? "Notified"
                          : "Pending"}
                      </span>
                    </div>
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

interface ScoringJobItem {
  job_id: number;
  job_title: string;
  job_location: string;
  department: { name: string; id: number }[];
}

interface ScoringCandidateItem {
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  profile_score: string;
  summary?: string;
  overall_score?: string | null;
  reasons?: string | string[] | null;
  is_employer_notified: boolean;
}
