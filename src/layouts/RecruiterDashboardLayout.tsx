import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import { GaugeCircleIcon } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { ROUTES } from "../routes/routes";
import { Header, SideBar } from "./common";

export function RecruiterDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark flex h-screen overflow-hidden">
      <SideBar
        links={SideBarLinks.Dashboard}
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
      />
      <div
        id="layout"
        className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
      >
        <Header setSidebarOpen={setSidebarOpen} />
        <div className="bg-gray-100 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const SideBarLinks = {
  Dashboard: [
    {
      title: "Dashboard",
      link: ROUTES.RECRUITER.DASHBOARD.path,
      icon: <Squares2X2Icon className="h-5 w-5" />,
    },
    {
      title: "Jobs",
      link: ROUTES.RECRUITER.LIST_JOBS.path,
      icon: <BriefcaseIcon className="h-5 w-5" />,
    },
    {
      title: "Candidate",
      link: ROUTES.RECRUITER.LIST_CANDIDATE.path,
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      title: "Scoring",
      link: ROUTES.RECRUITER.LIST_SCORING.path,
      icon: <GaugeCircleIcon className="h-5 w-5" />,
    },
    {
      title: "Onboarding",
      link: ROUTES.RECRUITER.ONBOARDING.path,
      icon: <GaugeCircleIcon className="h-5 w-5" />,
    },
    {
      title: "Reports",
      link: ROUTES.RECRUITER.LIST_REPORT.path,
      icon: <GaugeCircleIcon className="h-5 w-5" />,
    },
  ],
};
