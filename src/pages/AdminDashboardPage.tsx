import {
  AdjustmentsHorizontalIcon,
  AdjustmentsVerticalIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import {
  BadgeCheck,
  BadgeX,
  MailCheck,
  MailPlus,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { EventCalendar, EventItem } from "@/components/EventCalendar";
import { EventTodo } from "@/components/EventTodo";
import OnboardingListing from "@/components/OnboardingListing";
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
        interview_date:
          [e.action?.interview?.date, e.action?.interview?.time].join("T") +
          "Z",
        job_title: e.job.title?.replace(/Followup/, "Follow up"),
        pending_action: e.type,
        id: e.action.interview.onboarding_id,
        title: e.type?.replace(/Followup/, "Follow up"),
      }));
    },
  });

  return (
    <main>
      <div className="mx-auto w-full p-4 md:p-6 2xl:p-10">
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
        {/* {isRecruiter ? <ListRecruiterActions /> : null} */}
        <div className="py-8">
          <h2 className="mb-6 text-title-md2 font-bold text-black dark:text-white">
            Quick Links
          </h2>
          <div
            className={cn(
              "grid grid-cols-1 gap-4",
              isRecruiter
                ? "col-span-3 md:grid-cols-4"
                : "col-span-3 md:grid-cols-4",
            )}
          >
            {/* <Link
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
              </Link> */}
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        open_candidates: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        open_candidates: "True",
                      },
                    )
              }
            >
              <Card
                icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
                title="Total Open Candidates"
                value={
                  String(dashboardOverviewQuery.data?.total_open_candt) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                      {},
                      {
                        open_jobs: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_JOBS.buildPath(
                      {},
                      {
                        open_jobs: "True",
                      },
                    )
              }
            >
              <Card
                icon={<BriefcaseIcon className="h-8 w-8 text-blue-500" />}
                title="Total Open Jobs"
                value={
                  String(dashboardOverviewQuery.data?.total_open_jobs) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        non_responsive_candidates: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        non_responsive_candidates: "True",
                      },
                    )
              }
            >
              <Card
                icon={<NoSymbolIcon className="h-8 w-8 text-red-600" />}
                title="Total Non-Responsive Candidates"
                value={
                  String(
                    dashboardOverviewQuery.data
                      ?.total_non_responsive_candidates,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                      {},
                      {
                        non_responsive_jobs: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_JOBS.buildPath(
                      {},
                      {
                        non_responsive_jobs: "True",
                      },
                    )
              }
            >
              <Card
                icon={
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                }
                title="Total Non-Responsive Jobs"
                value={
                  String(
                    dashboardOverviewQuery.data?.total_non_responsive_jobs,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>

            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        responded_candidates: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        responded_candidates: "True",
                      },
                    )
              }
            >
              <Card
                icon={<UserRoundCheck className="h-8 w-8 text-lime-600" />}
                title="Total Responded Candidates"
                value={
                  String(
                    dashboardOverviewQuery.data?.total_responded_candidates,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                      {},
                      {
                        responded_jobs: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_JOBS.buildPath(
                      {},
                      {
                        responded_jobs: "True",
                      },
                    )
              }
            >
              <Card
                icon={<BadgeCheck className="h-8 w-8 text-sky-500" />}
                title="Total Responded Jobs"
                value={
                  String(dashboardOverviewQuery.data?.total_responded_jobs) ||
                  ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        non_matched_candidates: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        non_matched_candidates: "True",
                      },
                    )
              }
            >
              <Card
                icon={<UserRoundX className="h-8 w-8 text-pink-600" />}
                title="Total Non Matched Candidates"
                value={
                  String(
                    dashboardOverviewQuery.data?.total_non_matched_candidates,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                      {},
                      {
                        non_matched_jobs: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_JOBS.buildPath(
                      {},
                      {
                        non_matched_jobs: "True",
                      },
                    )
              }
            >
              <Card
                icon={<BadgeX className="h-8 w-8 text-amber-500" />}
                title="Total Non Matched Jobs"
                value={
                  String(dashboardOverviewQuery.data?.total_non_matched_jobs) ||
                  ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        final_followedup_candidates: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        final_followedup_candidates: "True",
                      },
                    )
              }
            >
              <Card
                icon={<MailCheck className="h-8 w-8 text-cyan-600" />}
                title="Total Final Followed up Candidates"
                value={
                  String(
                    dashboardOverviewQuery.data
                      ?.total_final_followedup_candidates,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_EMPLOYER.buildPath(
                      {},
                      {
                        final_followedup_employers: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_EMPLOYER.buildPath(
                      {},
                      {
                        final_followedup_employers: "True",
                      },
                    )
              }
            >
              <Card
                icon={<MailPlus className="h-8 w-8 text-teal-600" />}
                title="Total Final Followed up Employers"
                value={
                  String(
                    dashboardOverviewQuery.data
                      ?.total_final_followedup_employers,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>

            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        interview_scheduled_candidates: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        interview_scheduled_candidates: "True",
                      },
                    )
              }
            >
              <Card
                icon={<PhoneIcon className="h-8 w-8 text-green-400" />}
                title="Total Interview Scheduled Candidates"
                value={
                  String(
                    dashboardOverviewQuery.data
                      ?.total_interview_scheduled_candidates,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                      {},
                      {
                        interview_scheduled_jobs: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_JOBS.buildPath(
                      {},
                      {
                        interview_scheduled_jobs: "True",
                      },
                    )
              }
            >
              <Card
                icon={<BuildingOfficeIcon className="h-8 w-8 text-teal-400" />}
                title="Total Interview Scheduled Jobs"
                value={
                  String(
                    dashboardOverviewQuery.data?.total_interview_scheduled_jobs,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        today_scrapped_candidates: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_CANDIDATE.buildPath(
                      {},
                      {
                        today_scrapped_candidates: "True",
                      },
                    )
              }
            >
              <Card
                icon={
                  <AdjustmentsVerticalIcon className="h-8 w-8 text-fuchsia-700" />
                }
                title="Total Candidates Scraped Today"
                value={
                  String(
                    dashboardOverviewQuery.data?.total_candt_scrapped_tdy,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                      {},
                      {
                        today_scrapped_jobs: "True",
                      },
                    )
                  : ROUTES.ADMIN.LIST_JOBS.buildPath(
                      {},
                      {
                        today_scrapped_jobs: "True",
                      },
                    )
              }
            >
              <Card
                icon={
                  <AdjustmentsHorizontalIcon className="h-8 w-8 text-purple-700" />
                }
                title="Total Jobs Scraped Today"
                value={
                  String(
                    dashboardOverviewQuery.data?.total_jobs_scrapped_tdy,
                  ) || ""
                }
                isLoading={dashboardOverviewQuery.isLoading}
              />
            </Link>
          </div>
        </div>
        <OnboardingListing />
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
    <div className="dark:bg-boxdark dark:border-strokedark h-full rounded-none border border-stroke bg-white p-4 shadow-default md:p-6 xl:p-7.5">
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
