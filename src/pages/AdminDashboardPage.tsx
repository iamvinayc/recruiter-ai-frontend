import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { EventCalendar, EventItem } from "@/components/EventCalendar";
import { EventTodo } from "@/components/EventTodo";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import dayjs from "dayjs";
import { useState } from "react";
import { axiosApi } from "../api/api";
import { cn, emptyArray } from "../utils";

export function AdminDashboardPage() {
  const { isRecruiter } = useLogin();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const selectedDateFormat = selectedDate.format("DD-MM-YYYY");
  const dashboardOverviewQuery = useQuery({
    queryKey: ["DashboardPage"],
    queryFn: async () => {
      return axiosApi({
        url: "dashboard/overview/",
        method: "GET",
      }).then((e) => e.data.data);
    },
  });
  const {
    data: listRecruiterActions = emptyArray,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["user/recruiter/actions", selectedDateFormat],
    queryFn: async () => {
      return axiosApi({
        url: "user/recruiter/actions/",
        method: "GET",
        params: {
          date: selectedDateFormat,
        },
      }).then((e) => e.data.data);
    },
    select(data) {
      return data.map<EventItem>((e) => ({
        candidate_name: e.candidate.name,
        interview_date: [
          e.action?.interview?.date,
          e.action?.interview?.time,
        ].join(" "),
        job_title: e.job.title,
        pending_action: e.type,
        id: e.action.interview.onboarding_id,
        title: e.type,
      }));
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

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <EventCalendar />
          <EventTodo
            events_data={listRecruiterActions}
            isLoading={isLoading || isRefetching}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>

        <div className="">
          {/* {isRecruiter ? <ListRecruiterActions /> : null} */}
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
