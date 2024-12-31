import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import { FileCheck2Icon, GaugeIcon } from "lucide-react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "../routes/routes";
import { Header } from "./common";

export function RecruiterDashboardLayout() {
  return (
    <SidebarProvider
      defaultOpen={false}
      className="dark:bg-boxdark-2 dark:text-bodydark flex h-screen overflow-hidden"
    >
      <AppSidebar items={SideBarLinks} />
      <div
        id="layout"
        className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
      >
        <Header />
        <div className="bg-gray-100 h-full">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
  // return (
  //   <div className="dark:bg-boxdark-2 dark:text-bodydark flex h-screen overflow-hidden">
  //     <SideBar
  //       links={SideBarLinks.Dashboard}
  //       setSidebarOpen={setSidebarOpen}
  //       sidebarOpen={sidebarOpen}
  //     />
  //     <div
  //       id="layout"
  //       className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
  //     >
  //       <Header setSidebarOpen={setSidebarOpen} />
  //       <div className="bg-gray-100 h-full">
  //         <Outlet />
  //       </div>
  //     </div>
  //   </div>
  // );
}

const SideBarLinks = [
  {
    title: "Dashboard",
    link: ROUTES.RECRUITER.DASHBOARD.path,
    icon: <Squares2X2Icon className="h-5 w-5" />,
  },
  {
    title: "Company",
    link: ROUTES.RECRUITER.LIST_EMPLOYER.path,
    icon: <BriefcaseIcon className="h-5 w-5" />,
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
    icon: <GaugeIcon className="h-5 w-5" />,
  },
  {
    title: "Onboarding",
    link: ROUTES.RECRUITER.ONBOARDING.path,
    icon: <FileCheck2Icon className="h-5 w-5" />,
  },
  {
    title: "Reports",
    link: ROUTES.RECRUITER.LIST_REPORT.path,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M15 18a3 3 0 1 0-6 0" />
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
        <circle cx="12" cy="13" r="2" />
      </svg>
    ),
  },
];
