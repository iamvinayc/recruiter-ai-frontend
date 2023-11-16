import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input } from "../components/common/Input";
import { SpinnerIcon } from "../components/common/SvgIcons";
import { PopupDialog } from "../components/PopupDialog";
import { cn } from "../utils";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();

export function AdminListRecruiterPage() {
  const [showAddRecruiterDialog, setShowAddRecruiterDialog] = useState(false);
  const [showAddingDepartmentUserId, setShowAddingDepartmentUserId] = useState<
    number | null
  >(null);

  //#region query/mutation
  const departmentListQuery = useQuery({
    queryKey: ["AdminListDepartmentPage"],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/department/",
        method: "GET",
        params: { type: 1 },
      }).then((e) => e.data.data),
  });
  const recruiterListQuery = useQuery({
    queryKey: ["AdminListRecruiterPage"],
    queryFn: async () =>
      axiosApi({
        url: "user/recruiter/",
        method: "GET",
      }).then((e) => e.data.data),
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      axiosApi({
        url: `user/config/${id}/` as "user/config/",
        method: "PUT",
        data: { is_active },
      }).then((e) => e.data.isSuccess),
  });

  // --- funcs
  const onChangeStatus = useCallback((id: number, checked: boolean) => {
    changeStatusMutation
      .mutateAsync({ id, is_active: checked })
      .then((success) => {
        if (success) recruiterListQuery.refetch();
        else throw new Error("");
      })
      .catch(() => toast.error("Some error ocurred"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddNewDepartment = useCallback((id: number) => {
    setShowAddingDepartmentUserId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //#endregion

  console.log("re-render");

  //#region memo states

  const columns = useMemo(
    () => [
      columnHelper.accessor("first_name", {
        header: "First Name",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("last_name", {
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.renderValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("is_active", {
        header: "Active",
        cell: (info) => (
          <div>
            <input
              type="checkbox"
              onChange={(e) => {
                console.log(info);

                const checked = e.target.checked;
                onChangeStatus(info.row.original.user_id, checked);
              }}
              checked={info.renderValue() || false}
            />
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("departments", {
        header: "Departments",
        cell: (info) => {
          return (
            <ChipGroup
              items={info.getValue()}
              onAdd={() => onAddNewDepartment(info.row.original.id)}
            />
          );
        },
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => {
          return <ChipGroup items={info.getValue()} />;
        },
      }),
    ],
    [onAddNewDepartment, onChangeStatus],
  );

  const recruiterList = useMemo(
    () =>
      recruiterListQuery.data?.map<Person>((e) => ({
        ...e.user,
        user_id: e.user.id,
        id: e.id,
        departments: e.departments.map((e) => ({ id: e.id, name: e.name })),
        location: e.location.map((e) => ({ id: e.id, name: e.label })),
      })) || defaultArr,
    [recruiterListQuery.data],
  );

  const departments = useMemo(
    () =>
      departmentListQuery.data?.filter(
        (e) =>
          !recruiterList
            .find((e) => e.id == showAddingDepartmentUserId)
            ?.departments?.map((e) => e.id)
            ?.includes(e.id),
      ) || defaultArr,
    [departmentListQuery.data, recruiterList, showAddingDepartmentUserId],
  );
  //#endregion

  const table = useReactTable({
    columns: columns,
    data: recruiterList,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Recruiter
          </h2>
          <div>
            <button
              type="button"
              onClick={() => setShowAddRecruiterDialog(true)}
              className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
            >
              <PlusIcon className="h-6 w-6 stroke-2" />
              Add Recruiter
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div className="dark:bg-boxdark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark">
            <table className="w-full   table-fixed overflow-scroll">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        className="border-b border-slate-200 p-4 pb-3 pl-8  text-left font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200"
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="relative">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        className="border-b border-slate-200 p-4 pl-8 text-slate-500 dark:border-slate-600 dark:text-slate-400"
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-full items-center justify-center bg-white bg-opacity-50",
                changeStatusMutation.isPending ||
                  recruiterListQuery.isRefetching
                  ? "flex"
                  : "hidden",
              )}
            >
              <SpinnerIcon className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
      </div>
      <AddRecruiterDialog
        isOpen={showAddRecruiterDialog}
        setIsOpen={setShowAddRecruiterDialog}
        onSuccess={() => {
          setShowAddRecruiterDialog(false);
          recruiterListQuery.refetch();
        }}
      />
      <AddDepartmentDialog
        isOpen={showAddingDepartmentUserId !== null}
        setIsOpen={() => setShowAddingDepartmentUserId(null)}
        onSuccess={() => {
          setShowAddingDepartmentUserId(null);
          recruiterListQuery.refetch();
        }}
        departments={departments}
        selectedUserId={showAddingDepartmentUserId}
      />
    </main>
  );
}

//#region Table helper

interface Person {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  departments: { id: number; name: string }[];
  location: { id: number; name: string }[];
  is_active: boolean;
}

//#endregion

//#region AddRecruiterDialog
const AddRecruiterDialog = ({
  onSuccess,
  isOpen,
  setIsOpen,
}: {
  onSuccess: VoidFunction;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<z.TypeOf<typeof recruiterFromData>>({
    resolver: zodResolver(recruiterFromData),
  });

  const addRecruiterMutation = useMutation({
    mutationKey: ["addRecruiterMutation"],
    mutationFn: async (data: z.TypeOf<typeof recruiterFromData>) =>
      axiosApi({
        url: "user/register/",
        method: "POST",
        data: data,
      }).then((e) => e.data.isSuccess),
  });

  const onNewRecruiterAdd = (data: z.TypeOf<typeof recruiterFromData>) => {
    addRecruiterMutation
      .mutateAsync(data)
      .then((success) => {
        if (success) {
          toast.success("New location added successfully");
          reset({ email: "", first_name: "", last_name: "" });
          onSuccess();
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
    <PopupDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add new Recruiter"
    >
      <form onSubmit={handleSubmit(onNewRecruiterAdd)}>
        <div className="mb-4 space-y-2 py-4">
          <Input
            label="First Name"
            placeholder="First Name"
            className="px-3 py-3"
            disabled={addRecruiterMutation.isPending}
            register={register}
            name="first_name"
            error={errors.first_name?.message}
          />
          <Input
            label="Last Name"
            placeholder="Last Name"
            className="px-3 py-3"
            disabled={addRecruiterMutation.isPending}
            register={register}
            name="last_name"
            error={errors.last_name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Email"
            className="px-3 py-3"
            disabled={addRecruiterMutation.isPending}
            register={register}
            name="email"
            error={errors.email?.message}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={addRecruiterMutation.isPending}
            className="py-2"
          >
            Add Recruiter
          </Button>
        </div>
      </form>
    </PopupDialog>
  );
};

const recruiterFromData = z.object({
  first_name: z.string().min(1, "Please enter first name"),
  last_name: z.string().min(1, "Please enter last name"),
  email: z.string().email(),
});
//#endregion
//#region AddDepartmentDialog
const AddDepartmentDialog = ({
  onSuccess,
  isOpen,
  setIsOpen,
  departments,
  selectedUserId,
}: {
  onSuccess: VoidFunction;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  departments: { id: number; name: string; description: string }[];
  selectedUserId: number | null;
}) => {
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>(
    [],
  );
  const addDepartmentMutation = useMutation({
    mutationFn: ({ id, departments }: { id: number; departments: number[] }) =>
      axiosApi({
        url: `user/recruiter/${id}/` as "user/recruiter",
        method: "PATCH",
        data: { departments },
      }).then((e) => e.data.isSuccess),
  });
  const onNewRecruiterAdd = () => {
    if (!selectedUserId) return;
    addDepartmentMutation
      .mutateAsync({ id: selectedUserId, departments: selectedDepartmentIds })
      .then((success) => {
        if (success) {
          setSelectedDepartmentIds([]);
          toast.success("Added new department successfully");
          onSuccess();
          return;
        } else {
          throw new Error("Some error ocurred");
        }
      })
      .catch(() => {
        toast.error("Some error ocurred");
      });
  };
  useEffect(() => {
    return () => {
      setSelectedDepartmentIds([]);
    };
  }, [isOpen]);

  return (
    <PopupDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add new department"
    >
      <div>
        <div className="mb-4 space-y-2 py-4">
          <div className="flex flex-col gap-2">
            {departments.map(({ id, description, name }) => (
              <label key={id}>
                <div className="flex w-full items-start space-x-2">
                  <input
                    type="checkbox"
                    className="m-2"
                    checked={selectedDepartmentIds.includes(id)}
                    onChange={() => {
                      setSelectedDepartmentIds((prevIds) =>
                        prevIds.includes(id)
                          ? prevIds.filter((e) => e !== id)
                          : prevIds.concat(id),
                      );
                    }}
                  />
                  <div>
                    <div className="text-lg text-black">{name}</div>
                    <div className="text-xs">{description}</div>
                  </div>
                </div>
              </label>
            ))}
            {departments.length == 0 ? (
              <div className="flex min-h-[8rem] items-center justify-center">
                No Departments
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            isLoading={addDepartmentMutation.isPending}
            disabled={
              addDepartmentMutation.isPending ||
              selectedDepartmentIds.length == 0
            }
            onClick={onNewRecruiterAdd}
            className="py-2 disabled:border-slate-600 disabled:bg-slate-500"
          >
            Add Department
          </Button>
        </div>
      </div>
    </PopupDialog>
  );
};

//#endregion
