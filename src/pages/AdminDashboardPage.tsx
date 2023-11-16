import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import { useQuery } from "@tanstack/react-query";

import { axiosApi } from "../api/api";
import { cn } from "../utils";

export function AdminDashboardPage() {
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 2xl:gap-7.5">
          <Card
            icon={<UserCircleIcon className="h-8 w-8 text-[#3C50E0]" />}
            title="Total Candidates"
            value={String(dashboardOverviewQuery.data?.total_candidates) || ""}
            isLoading={dashboardOverviewQuery.isLoading}
          />
          <Card
            icon={<BriefcaseIcon className="h-8 w-8 text-[#10B981]" />}
            title="Total Jobs"
            value={String(dashboardOverviewQuery.data?.total_jobs) || ""}
            isLoading={dashboardOverviewQuery.isLoading}
          />
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
    <div className="dark:bg-boxdark rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark md:p-6 xl:p-7.5">
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
