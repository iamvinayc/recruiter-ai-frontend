import { useState } from "react";
import { Outlet } from "react-router-dom";

import { ROUTES } from "../routes/routes";
import { Header, SideBar } from "./common";

export function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    { title: "Home", link: ROUTES.ADMIN.DASHBOARD.path },
    { title: "List Department", link: ROUTES.ADMIN.LIST_DEPARTMENT.path },
    { title: "List Recruiter", link: ROUTES.ADMIN.LIST_RECRUITER.path },
    { title: "List Location", link: ROUTES.ADMIN.LIST_LOCATION.path },
  ],
};
