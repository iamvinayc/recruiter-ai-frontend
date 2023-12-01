/* eslint-disable @typescript-eslint/no-explicit-any */
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Column,
  ColumnFilter,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { LocationSelectorMultiple } from "@/components/LocationSelector";
import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { DebouncedInput, Input } from "../components/common/Input";
import { SpinnerIcon } from "../components/common/SvgIcons";
import { PopupDialog } from "../components/PopupDialog";
import { cn, emptyArray } from "../utils";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();
const nameMap = {
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email",
  is_active: "Is Active",
  departments: "Skills",
  location: "Location",
};
export function AdminListRecruiterPage() {
  const [showAddRecruiterDialog, setShowAddRecruiterDialog] = useState(false);
  const [showAddingDepartmentUserId, setShowAddingDepartmentUserId] = useState<
    number | null
  >(null);
  const [showAddingLocationUserId, setShowAddingLocationUserId] = useState<
    number | null
  >(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  //#region query/mutation
  const departmentListQuery = useQuery({
    queryKey: ["AdminListDepartmentPage"],
    queryFn: async () => {
      return axiosApi({
        url: "data-sourcing/department/",
        method: "GET",
        params: { type: 1 },
      }).then((e) => e.data.data);
    },
  });
  const recruiterListQuery = useQuery({
    queryKey: ["AdminListRecruiterPage", columnFilters],
    queryFn: async () => {
      type PersonKeys = keyof Person;
      const location = columnFilters.find(
        (e) => (e.id as PersonKeys) === "location",
      )?.value;
      const department = columnFilters.find(
        (e) => (e.id as PersonKeys) === "departments",
      )?.value;
      const name = columnFilters.find(
        (e) =>
          (e.id as PersonKeys) === "last_name" ||
          (e.id as PersonKeys) === "first_name",
      )?.value;
      const email = columnFilters.find((e) => (e.id as PersonKeys) === "email")
        ?.value;
      const active = columnFilters.find(
        (e) => (e.id as PersonKeys) === "is_active",
      )?.value;

      const params = {
        location,
        department,
        name,
        email,
        active: active ? 1 : undefined,
        // signedup: 0,
      };
      console.log("params", params);

      return axiosApi({
        url: "user/recruiter/",
        method: "GET",
        params: params as any,
      }).then((e) => e.data.data);
    },
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
  const onAddLocation = useCallback((id: number) => {
    setShowAddingLocationUserId(id);
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
        cell: (info) => (
          <div className=" max-w-[200px] overflow-hidden truncate ">
            {info.renderValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("is_active", {
        header: "Active",
        cell: (info) => (
          <div className="w-auto text-center">
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
              addLabel={info.getValue().length === 0 ? "+ Add" : "Edit"}
            />
          );
        },
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => {
          return (
            <ChipGroup
              items={info.getValue()}
              onAdd={() => onAddLocation(info.row.original.id)}
              addLabel={info.getValue().length === 0 ? "+ Add" : "Edit"}
            />
          );
        },
      }),
    ],
    [onAddLocation, onAddNewDepartment, onChangeStatus],
  );
  console.log("recruiterListQuery.data", recruiterListQuery.data?.length);

  const recruiterList = useMemo(
    () =>
      recruiterListQuery.data?.map<Person>((e) => ({
        ...e.user,
        email: e.user.email,
        user_id: e.user.id,
        id: e.id,
        departments: e.departments.map((e) => ({ id: e.id, name: e.name })),
        location: e.location.map((e) => ({ id: e.id, name: e.name })),
      })) || defaultArr,
    [recruiterListQuery.data],
  );

  const departments = useMemo(
    () => departmentListQuery.data || defaultArr,
    // ?.filter(
    //   (e) =>
    //     !recruiterList
    //       .find((e) => e.id == showAddingDepartmentUserId)
    //       ?.departments?.map((e) => e.id)
    //       ?.includes(e.id),
    // )

    [departmentListQuery.data],
  );
  //#endregion

  const table = useReactTable({
    columns: columns,
    data: recruiterList,
    state: { columnFilters },
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
  });
  console.log("columnFilters", columnFilters);

  const selectedDepartmentIds =
    recruiterList
      .find((e) => String(e.id) === String(showAddingDepartmentUserId))
      ?.departments?.map((e) => e.id) || [];
  const selectedLocationIds =
    recruiterList.find((e) => String(e.id) === String(showAddingLocationUserId))
      ?.location || emptyArray;
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
          <div className="dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default">
            <table className="divide-gray-200 min-w-full divide-y overflow-x-auto">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        scope="col"
                        className="text-gray-500 px-6 py-3 text-left text-xs font-medium tracking-wider"
                        key={header.column.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanFilter() ? (
                          <Filter column={header.column} table={table} />
                        ) : null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-gray-200 divide-y bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td className="whitespace-nowrap px-6 py-4" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className={cn(recruiterList.length > 0 && "hidden")}>
                  <td colSpan={6}>
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full w-full items-center justify-center bg-white bg-opacity-50",

                        changeStatusMutation.isPending ||
                          recruiterListQuery.isLoading ||
                          recruiterListQuery.isRefetching
                          ? "flex"
                          : "hidden",
                      )}
                    >
                      <SpinnerIcon className="h-6 w-6 text-black" />
                    </div>
                    {!recruiterListQuery.isLoading &&
                      recruiterList?.length === 0 && (
                        <div
                          className={cn(
                            "h-[20rem]",
                            "flex w-full items-center justify-center",
                          )}
                        >
                          No Data
                        </div>
                      )}
                    {recruiterListQuery.isLoading &&
                      recruiterList?.length === 0 && (
                        <div
                          className={cn(
                            "h-[20rem]",
                            "flex w-full items-center justify-center",
                          )}
                        >
                          Loading ....
                        </div>
                      )}
                  </td>
                </tr>
              </tbody>
            </table>
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
        isUpdate={selectedDepartmentIds.length > 0}
        isOpen={showAddingDepartmentUserId !== null}
        setIsOpen={() => setShowAddingDepartmentUserId(null)}
        onSuccess={() => {
          setShowAddingDepartmentUserId(null);
          recruiterListQuery.refetch();
        }}
        prevSelectedDepartmentIds={selectedDepartmentIds}
        departments={departments}
        selectedUserId={showAddingDepartmentUserId}
      />
      <AddLocationDialog
        isUpdate={selectedLocationIds.length > 0}
        isOpen={showAddingLocationUserId !== null}
        setIsOpen={() => setShowAddingLocationUserId(null)}
        onSuccess={() => {
          setShowAddingLocationUserId(null);
          recruiterListQuery.refetch();
        }}
        locations={selectedLocationIds}
        selectedUserId={showAddingLocationUserId}
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
          toast.success("New recruiter added successfully");
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
  prevSelectedDepartmentIds = [],
  isUpdate,
}: {
  onSuccess: VoidFunction;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  departments: { id: number; name: string; description?: string }[];
  prevSelectedDepartmentIds: number[];
  selectedUserId: number | null;
  isUpdate: boolean;
}) => {
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>(
    [],
  );
  useEffect(() => {
    if (prevSelectedDepartmentIds && prevSelectedDepartmentIds.length > 0) {
      setSelectedDepartmentIds(prevSelectedDepartmentIds);
      console.log("prevSelectedDepartmentIds", prevSelectedDepartmentIds);
    }
  }, [prevSelectedDepartmentIds]);
  console.log("selectedDepartmentIds", selectedDepartmentIds);

  const addDepartmentMutation = useMutation({
    mutationKey: ["addDepartmentMutation"],
    mutationFn: ({ id, departments }: { id: number; departments: number[] }) =>
      axiosApi({
        url: `user/recruiter_department/${id}/` as "user/recruiter_department",
        method: "PUT",
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
          toast.success("Added new skill successfully");
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
      title={isUpdate ? "Update skill" : "Add new skill"}
    >
      <div>
        <div className="mb-4 space-y-2 py-4">
          <div className="flex max-h-[65vh] flex-col gap-2 overflow-y-scroll">
            {departments.map(({ id, description, name }, i) => (
              <label key={`department-${i}`}>
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
                No Skills
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
            {isUpdate ? "Update skill" : "Add skill"}
          </Button>
        </div>
      </div>
    </PopupDialog>
  );
};
const AddLocationDialog = ({
  onSuccess,
  isOpen,
  setIsOpen,
  locations,
  selectedUserId,
  isUpdate,
}: {
  onSuccess: VoidFunction;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  locations: { id: number; name: string }[];
  selectedUserId: number | null;
  isUpdate: boolean;
}) => {
  const [selectedLocation, setSelectedLocation] = useState<
    {
      name: string;
      id?: number | undefined;
    }[]
  >([]);
  useEffect(() => {
    if (locations) {
      setSelectedLocation(locations);
    }
  }, [locations]);

  const addLocationMutation = useMutation({
    mutationKey: ["addLocationMutation"],
    mutationFn: ({ id, locations }: { id: number; locations: number[] }) =>
      axiosApi({
        url: `user/recruiter_location/${id}/` as "user/recruiter_location/",
        method: "PUT",
        data: { locations },
      }).then((e) => e.data.isSuccess),
  });
  const onAddLocation = () => {
    if (!selectedUserId) return console.log("no user id", selectedUserId);
    const ids = selectedLocation
      .map((e) => e.id)
      .filter((e): e is number => Boolean(e));
    if (ids.length == 0)
      return console.log("no selected location", selectedLocation);
    addLocationMutation
      .mutateAsync({ id: selectedUserId, locations: ids })
      .then((success) => {
        if (success) {
          setSelectedLocation([]);
          toast.success("Added new location successfully");
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
      setSelectedLocation([]);
    };
  }, [isOpen]);

  return (
    <PopupDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={isUpdate ? "Update location" : "Add location"}
    >
      <div>
        <div className="mb-4 space-y-2 py-4">
          <div className="flex flex-col gap-2">
            <LocationSelectorMultiple
              selectedItems={selectedLocation}
              setSelectedItems={setSelectedLocation}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            isLoading={addLocationMutation.isPending}
            disabled={
              addLocationMutation.isPending || selectedLocation?.length === 0
            }
            onClick={onAddLocation}
            className="py-2 disabled:border-slate-600 disabled:bg-slate-500"
          >
            {isUpdate ? "Update location" : "Add location"}
          </Button>
        </div>
      </div>
    </PopupDialog>
  );
};

//#endregion

//#region filter
const Filter = ({
  column,
}: {
  column: Column<any, unknown>;
  table: Table<any>;
}) => {
  const { setFilterValue, id } = column;
  const [value, setValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  if (id == "is_active") {
    return (
      <div className="w-auto text-center">
        <input
          type="checkbox"
          className="mt-2"
          checked={isChecked}
          onChange={(e) => {
            const val = e.currentTarget.checked;
            setIsChecked(val);
            setFilterValue(val);
          }}
        />
      </div>
    );
  }
  return (
    <div>
      <DebouncedInput
        className="mt-2 border border-slate-200 px-2 py-1 text-xs shadow-sm"
        type="text"
        placeholder={(nameMap as any)[id as any] || id}
        value={value}
        onChange={(val) => {
          setValue("" + val);
          setFilterValue("" + val);
        }}
      />
    </div>
  );
};
//#endregion filter
