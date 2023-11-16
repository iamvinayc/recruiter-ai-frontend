import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";

import { axiosApi } from "../api/api";

export function AdminListDepartmentPage() {
  const departmentListQuery = useQuery({
    queryKey: ["AdminListDepartmentPage"],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/department/",
        method: "GET",
        params: { type: 1 },
      }).then((e) => e.data.data),
  });
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Department
          </h2>
        </div>
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div className="dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark">
            <DataTable
              columns={columns}
              data={departmentListQuery.data || emptyArr}
              progressPending={departmentListQuery.isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
interface DepartmentListingResponseData {
  id: number;
  name: string;
  description: string;
}
const columns = [
  {
    name: "Name",
    selector: (row: DepartmentListingResponseData) => row.name,
  },
  {
    name: "Description",
    selector: (row: DepartmentListingResponseData) => row.description,
  },
];
const emptyArr: [] = [];
