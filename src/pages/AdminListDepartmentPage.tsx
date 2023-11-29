import { PlusIcon } from "@heroicons/react/20/solid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { PopupDialog } from "@/components/PopupDialog";
import { axiosApi } from "../api/api";

export function AdminListDepartmentPage() {
  const [showAddDepartmentPopup, setShowAddDepartmentPopup] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const departmentListQuery = useQuery({
    queryKey: ["AdminListDepartmentPage", showAddDepartmentPopup],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/department/",
        method: "GET",
        params: { type: 1 },
      }).then((e) => e.data.data),
  });

  const addDepartmentMutation = useMutation({
    mutationKey: ["addDepartmentMutation"],
    mutationFn: async ({ name }: { name: string }) =>
      axiosApi({
        url: "data-sourcing/department/" as "data-sourcing/department",
        method: "POST",
        data: { name: name, description: name },
      }).then((e) => e.data.isSuccess),
  });

  const onNewDepartmentAdd = () => {
    addDepartmentMutation
      .mutateAsync({ name: newDepartment })
      .then((success) => {
        if (success) {
          toast.success("New department added successfully");
          setShowAddDepartmentPopup(false);
          setNewDepartment("");
          departmentListQuery.refetch();
          return;
        } else {
          throw new Error("Some error ocurred");
        }
      })
      .catch(() => {
        toast.error("Some error ocurred");
      });
  };

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Skill
          </h2>
          <button
            type="button"
            onClick={() => {
              setShowAddDepartmentPopup(true);
            }}
            className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
          >
            <PlusIcon className="h-6 w-6 stroke-2" />
            Add Skill
          </button>
        </div>
        {departmentListQuery.isLoading ? (
          <div className="flex h-[30vh] items-center justify-center text-2xl font-bold">
            Loading....
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-2">
          {departmentListQuery.data?.map(({ id, name }) => (
            <span
              key={id}
              className=" inline-flex  text-ellipsis  rounded  bg-[#3BA2B8]  px-2 py-1 text-lg font-medium text-white hover:bg-opacity-90"
            >
              {name}
            </span>
          ))}
        </div>
        {/* <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div className="dark:bg-boxdark dark:border-strokedark rounded-sm border border-stroke bg-white shadow-default">
            <DataTable
              columns={columns}
              data={departmentListQuery.data || emptyArr}

              progressPending={departmentListQuery.isLoading}
            />
          </div>
        </div> */}
      </div>
      <PopupDialog
        isOpen={showAddDepartmentPopup}
        setIsOpen={setShowAddDepartmentPopup}
        title="Add new skill"
      >
        <div className="mb-4 py-4">
          <Input
            label="Skill"
            placeholder="Skill"
            containerClassName=""
            className="px-3 py-3"
            disabled={addDepartmentMutation.isPending}
            value={newDepartment}
            onInput={(e) =>
              setNewDepartment((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={onNewDepartmentAdd}
            isLoading={addDepartmentMutation.isPending}
            className="py-2"
          >
            Add Skill
          </Button>
        </div>
      </PopupDialog>
    </main>
  );
}
// interface DepartmentListingResponseData {
//   id: number;
//   name: string;
//   description: string;
// }
// const columns = [
//   {
//     name: "Name",
//     selector: (row: DepartmentListingResponseData) => row.name,
//   },
//   {
//     name: "Description",
//     selector: (row: DepartmentListingResponseData) => row.description,
//   },
// ];
// const emptyArr: [] = [];
