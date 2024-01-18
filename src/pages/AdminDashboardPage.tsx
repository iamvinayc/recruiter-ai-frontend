import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { axiosApi } from "../api/api";
import { cn, emptyArray } from "../utils";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import { ChipGroup } from "@/components/common/ChipGroup";

export function AdminDashboardPage() {
  const { isRecruiter } = useLogin();
  const dashboardOverviewQuery = useQuery({
    queryKey: ["DashboardPage"],
    queryFn: async () => {
      return axiosApi({
        url: "dashboard/overview/",
        method: "GET",
      }).then((e) => e.data.data);
    },
  });

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-5 ">
          <h2 className="mb-1.5 text-title-md2 font-bold text-black dark:text-white">
            Highlights
          </h2>
          <p className="font-medium">Latest statistics</p>
        </div>

        <div className="">
          {isRecruiter ? <ListRecruiterActions /> : null}
          <div
            className={cn(
              "grid grid-cols-1 gap-4 ",
              isRecruiter
                ? "col-span-4 md:grid-cols-4"
                : "col-span-4 md:grid-cols-4",
            )}
          >
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.path
                  : ROUTES.ADMIN.LIST_CANDIDATE.path
              }
            >
              <Card
                icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
                title="Total Candidates"
                value={
                  String(dashboardOverviewQuery.data?.total_candidates) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_JOBS.path
                  : ROUTES.ADMIN.LIST_JOBS.path
              }
            >
              <Card
                icon={<BriefcaseIcon className="h-8 w-8 text-[#10B981]" />}
                title="Total Jobs"
                value={String(dashboardOverviewQuery.data?.total_jobs) || ""}
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Card
              icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
              title="Total Candidate Responded"
              value={
                String(dashboardOverviewQuery.data?.total_candt_responded) || ""
              }
              isLoading={dashboardOverviewQuery.isLoading}
            />
            <Card
              icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
              title="Total Candidate Placed"
              value={
                String(dashboardOverviewQuery.data?.total_candt_placed) || ""
              }
              isLoading={dashboardOverviewQuery.isLoading}
            />
            <Card
              icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
              title="Total Open Candidate"
              value={
                String(dashboardOverviewQuery.data?.total_open_candt) || ""
              }
              isLoading={dashboardOverviewQuery.isLoading}
            />
            <Card
              icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
              title="Total Candidate Scraped Today"
              value={
                String(dashboardOverviewQuery.data?.total_candt_scrapped_tdy) ||
                ""
              }
              isLoading={dashboardOverviewQuery.isLoading}
            />
            <Card
              icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
              title="Total Interviews"
              value={
                String(dashboardOverviewQuery.data?.total_interviews) || ""
              }
              isLoading={dashboardOverviewQuery.isLoading}
            />
            <Card
              icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
              title="Total Open Jobs"
              value={String(dashboardOverviewQuery.data?.total_open_jobs) || ""}
              isLoading={dashboardOverviewQuery.isLoading}
            />
            <Card
              icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
              title="Total Jobs Scraped Today"
              value={
                String(dashboardOverviewQuery.data?.total_jobs_scrapped_tdy) ||
                ""
              }
              isLoading={dashboardOverviewQuery.isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

const Card = ({
  icon,
  title,
  value,
  isLoading,
}: {
  icon: JSX.Element;
  title: string;
  value: string;
  isLoading: boolean;
}) => {
  return (
    <div className="dark:bg-boxdark dark:border-strokedark rounded-sm border border-stroke bg-white p-4 shadow-default md:p-6 xl:p-7.5">
      {icon}
      <h4 className="mb-2 mt-5 font-medium">{title}</h4>
      <h3
        className={cn(
          "mb-2 inline-block rounded-md  text-title-md font-bold dark:text-white",
          isLoading
            ? "animate-pulse bg-slate-300 text-slate-300"
            : "text-black",
        )}
      >
        {isLoading ? "Loading..." : value}
      </h3>
    </div>
  );
};
const columnHelper = createColumnHelper<PendingItem>();

const ListRecruiterActions = () => {
  const {
    data: listRecruiterActions = emptyArray,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [],
    queryFn: async () => {
      return axiosApi({
        url: "user/recruiter/actions/",
        method: "GET",
      }).then((e) => e.data.data);
    },
    select(data) {
      return data.map<PendingItem>((e) => ({
        candidate_name: e.candidate.name,
        interview_date: [
          e.action?.interview?.date,
          e.action?.interview?.time,
        ].join(" "),
        job_title: e.job.title,
        pending_action: e.type,
      }));
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("pending_action", {
        header: "Pending Action",
        cell: (info) => (
          <div className=" truncate" title={info.getValue()}>
            <ChipGroup items={[{ id: 1, name: info.getValue() }]} />
            {}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
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
      columnHelper.accessor("interview_date", {
        header: "Interview Date",
        cell: (info) => (
          <div className=" truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
          // return <ChipGroup items={info.getValue()} />;
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns: columns,
    data: listRecruiterActions,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="relative mb-4 overflow-x-auto rounded-lg border bg-white shadow-md">
      <Table
        flat
        table={table}
        loader={
          <TableLoader
            colSpan={columns.length}
            dataList={listRecruiterActions}
            isLoading={isLoading}
            isUpdateLoading={isLoading || isRefetching}
          />
        }
      />
    </div>
  );
};

interface PendingItem {
  pending_action: string;
  job_title: string;
  candidate_name: string;
  interview_date: string;
}
