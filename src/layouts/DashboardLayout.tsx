import { Link, Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <div className="flex gap-x-2 divide-x-2 h-full">
      <div className="p-2">
        <div>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </div>
      </div>
      <div className="p-2">
        <Outlet />
      </div>
    </div>
  );
}
