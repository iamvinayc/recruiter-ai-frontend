import {
  CheckCircleIcon,
  EyeIcon,
  XMarkIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosApi, formatOnboardingStatus } from "@/api/api";
import { Link } from "react-router-dom";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { InfinityLoaderComponent } from "@/pages/common/InfinityLoaderComponent";
import { Table } from "@/pages/common/Table";
import { TableLoader } from "@/pages/common/TableLoader";
import {
  DebouncedInput,
} from "@/components/common/Input";
import { PopupDialog } from "@/components/PopupDialog";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { replaceWith } from "@/utils";

const columnHelper = createColumnHelper<CandidateSummaryResponseData>();

export function CandidateSummary() {
  const { isRecruiter } = useLogin();

  const [searchCandidateName, setSearchCandidateName] = useState("");

  const [showCandidateSummary, setShowCandidateSummary] = useState<
    number | null
  >(null);

  const candidateSummaryQuery = useInfiniteQuery({
    queryKey: ["candidateSummaryQuery", searchCandidateName],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: replaceWith(
          "dashboard/candidate_summary/",
          pageParam || "dashboard/candidate_summary/?page_size=16",
        ),
        method: "GET",
        params: {
          candidate_name: searchCandidateName,
        }
      }).then((e) => e.data),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: "",
  });

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "SLNo",
        header: "No",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("name", {
        header: () => (
          <div>
            <div>Candidate</div>
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
        cell: (info) => (
          <Link
            to={
              isRecruiter
                ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                    {},
                    {
                      id: info.row.original.id.toString(),
                    },
                  )
                : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                    {},
                    {
                      id: info.row.original.id.toString(),
                    },
                  )
            }
          >
            <div  title={info.getValue()}>
              {info.getValue()}
            </div>
          </Link>
        ),
      }),
      columnHelper.accessor("email", {
        header: () => <div>Candidate Email</div>,
        cell: (info) => (
          <div  title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.display({
        id: "action",
        header: () => <div className="flex justify-end px-5">Action</div>,
        cell: (info) => (
          <div className="flex justify-end px-5">
            <button
              onClick={() => setShowCandidateSummary(info.row.original.id)}
              className="rounded-md bg-[#55BCE7] p-3 text-white hover:bg-opacity-70"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const candidateList = useMemo(
    () =>
      candidateSummaryQuery.data?.pages?.map((page) => page.data)?.flat() || [],
    [candidateSummaryQuery.data],
  );

  const selectedCandidate = candidateList.find(
    (candidate) => candidate.id === showCandidateSummary,
  );

  const table = useReactTable({
    columns: columns,
    data: candidateList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Candidate Summary
          </h2>
        </div>
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={`dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default ${
              candidateSummaryQuery.isLoading && "min-h-[20rem]"
            }`}
          >
            <InfinityLoaderComponent
              height={828}
              dataLength={candidateList.length}
              hasMore={candidateSummaryQuery.hasNextPage}
              next={() => {
                candidateSummaryQuery.fetchNextPage();
              }}
            >
              <Table
                theadClassName="sticky w-full z-10 border-b-[solid] left-0 top-0 shadow-sm"
                table={table}
                loader={
                  <TableLoader
                    colSpan={columns.length}
                    dataList={candidateList}
                    isLoading={candidateSummaryQuery.isLoading}
                    isUpdateLoading={
                      candidateSummaryQuery.isLoading ||
                      candidateSummaryQuery.isRefetching
                    }
                  />
                }
              />
            </InfinityLoaderComponent>
          </div>
        </div>
      </div>
      {showCandidateSummary !== null && (
        <PopupDialog
          isOpen={showCandidateSummary !== null}
          setIsOpen={() => setShowCandidateSummary(null)}
          title=""
          containerClassName="relative max-w-[90%] md:max-w-[70%] lg:max-w-[60%] overflow-x-auto"
        >
          <div>
            <button
              className="absolute right-0 top-0 p-4"
              onClick={() => setShowCandidateSummary(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="mt-4">
              {selectedCandidate?.jobs.length !== 0 ? (
                <div className="space-y-4">
                  <div className="text-lg font-medium">
                    Job Summary of {selectedCandidate?.name}
                  </div>
                  <div className="max-h-[500px] overflow-x-auto">
                    <table className="divide-gray-200 min-w-full divide-y border">
                      <thead className="sticky top-0 z-10 mb-5 h-[40px] bg-slate-100 ">
                        <tr>
                          <th className="text-gray-500 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                            No
                          </th>
                          <th className="text-gray-500 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                            Position
                          </th>
                          <th className="text-gray-500 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-gray-500 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-gray-200 divide-y bg-white">
                        {selectedCandidate?.jobs.map((job, id) => (
                          <tr key={id}>
                            <td className="max-w-[40px] whitespace-nowrap px-4 py-4">
                              {id + 1}
                            </td>
                            <Link
                              to={
                                isRecruiter
                                  ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                                      {},
                                      { id: job.job_id.toString() },
                                    )
                                  : ROUTES.ADMIN.LIST_JOBS.buildPath(
                                      {},
                                      { id: job.job_id.toString() },
                                    )
                              }
                            >
                              <td
                                className="max-w-[200px] truncate whitespace-nowrap px-4 py-4"
                                title={job.job_name}
                              >
                                {job.job_name}
                              </td>
                            </Link>
                            <td className="max-w-[300px] truncate whitespace-nowrap px-4 py-4">
                              {formatOnboardingStatus(job.status)}
                            </td>
                            {job.onboarding_id ? (
                              <Link
                                to={
                                  isRecruiter
                                    ? ROUTES.RECRUITER.ONBOARDING.buildPath(
                                        {},
                                        { id: job.onboarding_id.toString() },
                                      )
                                    : ROUTES.ADMIN.ONBOARDING.buildPath(
                                        {},
                                        { id: job.onboarding_id.toString() },
                                      )
                                }
                              >
                                <td
                                  className="whitespace-nowrap px-7 py-4"
                                  title={job.status}
                                >
                                  <ArrowTopRightOnSquareIcon className="h-5 w-5 text-blue-500" />
                                </td>
                              </Link>
                            ) : job.status === "No Sufficient Score" ? (
                              <td className="whitespace-nowrap px-7 py-4">
                                <XCircleIcon className="h-5 w-5 text-red-500" />
                              </td>
                            ) : (
                              <td className="whitespace-nowrap px-7 py-4">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center gap-4">
                  No data.
                </div>
              )}
            </div>
          </div>
        </PopupDialog>
      )}
    </main>
  );
}

interface CandidateSummaryResponseData {
  id: number;
  name: string;
  email: string;
  jobs: {
    job_id: number;
    job_name: string;
    onboarding_id?: number;
    scoring_id: number;
    status: string;
  }[];
}
