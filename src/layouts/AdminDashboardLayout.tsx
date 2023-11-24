import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import UserIcon from "@heroicons/react/24/outline/UserIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsClient } from "usehooks-ts";

import { ROUTES } from "../routes/routes";
import { Header, SideBar } from "./common";

export function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isClient = useIsClient();
  useEffect(() => {
    if (!isClient) return;
    if (window.innerWidth > 1024) setSidebarOpen(true);
  }, [isClient]);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark flex h-screen overflow-hidden">
      <SideBar
        links={SideBarLinks.Dashboard}
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
      />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
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
      link: ROUTES.ADMIN.DASHBOARD.path,
      icon: <Squares2X2Icon className="h-5 w-5" />,
    },
    {
      title: "Department",
      link: ROUTES.ADMIN.LIST_DEPARTMENT.path,
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
    },
    {
      title: "Recruiter",
      link: ROUTES.ADMIN.LIST_RECRUITER.path,
      icon: <UserIcon className="h-5 w-5" />,
    },
    {
      title: "Location",
      link: ROUTES.ADMIN.LIST_LOCATION.path,
      icon: <MapPinIcon className="h-5 w-5" />,
    },
    {
      title: "Jobs",
      link: ROUTES.ADMIN.LIST_JOBS.path,
      icon: <BriefcaseIcon className="h-5 w-5" />,
    },
    {
      title: "Candidate",
      link: ROUTES.ADMIN.LIST_CANDIDATE.path,
      icon: <UsersIcon className="h-5 w-5" />,
    },
  ],
};
