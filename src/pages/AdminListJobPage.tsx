import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { z } from "zod";

import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input } from "../components/common/Input";
import { SpinnerIcon } from "../components/common/SvgIcons";
import { DepartmentSelector } from "../components/DepartmentSelector";
import { LocationSelector } from "../components/LocationSelector";
import { PopupDialog } from "../components/PopupDialog";
import { ROUTES } from "../routes/routes";
import { cn } from "../utils";
import { DepartmentLocationScrapeFromSearch } from "./common/DepartmentLocationScrapeFromSearch";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();

export function AdminListJobPage({
  hideAddBtn = false,
}: {
  hideAddBtn?: boolean;
}) {
  const [showAddJobPopup, _setShowAddJobPopup] = useState(false);
  const [{ department, location, scrape_from }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_JOBS,
  );

  //#region query/mutation

  const jobListQuery = useQuery({
    queryKey: ["jobListQuery", department, location, scrape_from],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/job/",
        method: "GET",
        params: {
          department: department || undefined,
          location: location || undefined,
          scrape_from: scrape_from || undefined,
        },
      }).then((e) => e.data.data),
  });

  //#endregion

  console.log("re-render");

  //#region memo states

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("employer", {
        header: "Employer",
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("departments", {
        header: "Departments",
        cell: (info) => {
          return <ChipGroup items={info.getValue()} />;
        },
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => {
          return <ChipGroup items={info.getValue()} />;
        },
      }),
    ],
    [],
  );

  const jobList = useMemo(
    () =>
      jobListQuery.data?.map<Person>((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        location: [{ id: e.location.id, name: e.location.name }],
        departments: e.departments.map((e) => ({ id: e.id, name: e.name })),
        employer: e.employer.employer_label,
      })) || defaultArr,
    [jobListQuery.data],
  );

  //#endregion

  const table = useReactTable({
    columns: columns,
    data: jobList,
    getCoreRowModel: getCoreRowModel(),
  });
  const setShowAddJobPopup = (v: React.SetStateAction<boolean>) => {
    const value = typeof v === "function" ? v(showAddJobPopup) : v;
    _setShowAddJobPopup(value);
    if (value === false) jobListQuery.refetch();
  };
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Jobs
          </h2>
          {hideAddBtn ? null : (
            <button
              type="button"
              onClick={() => setShowAddJobPopup(true)}
              className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
            >
              <PlusIcon className="h-6 w-6 stroke-2" />
              Add Job
            </button>
          )}
        </div>
        <DepartmentLocationScrapeFromSearch
          onSearch={() => {
            jobListQuery.refetch();
          }}
        />

        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              jobListQuery.isLoading && "min-h-[20rem]",
            )}
          >
            <table className={cn("w-full   table-fixed overflow-scroll")}>
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
            {!jobListQuery.isLoading && jobList?.length === 0 && (
              <div
                className={cn(
                  "h-[20rem]",
                  "flex w-full items-center justify-center",
                )}
              >
                No Data
              </div>
            )}
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-full items-center justify-center bg-white bg-opacity-50",

                jobListQuery.isLoading || jobListQuery.isRefetching
                  ? "flex"
                  : "hidden",
              )}
            >
              <SpinnerIcon className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
      </div>
      <AddJobPopup isOpen={showAddJobPopup} setIsOpen={setShowAddJobPopup} />
    </main>
  );
}

//#region Table helper

interface Person {
  id: number;
  title: string;
  description: string;
  employer: string;
  departments: { id: number; name: string }[];
  location: { id: number; name: string }[];
}

//#endregion

//#region Add Job Popup
const AddJobPopup = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm<z.TypeOf<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: [],
      location: { name: "" },
    },
  });
  const addJobMutation = useMutation({
    mutationKey: ["addJob"],
    mutationFn: (data: z.TypeOf<typeof formSchema>) =>
      axiosApi({
        url: "data-sourcing/job/" as "data-sourcing/job",
        method: "POST",
        data: {
          title: data.title,
          departments: data.department.map((e) => ({
            ...e,
            description: e.name,
          })),
          description: data.description,
          employer: {
            email: data.email,
            employer_label: data.employer_name,
            phone1: data.phone1,
            phone2: data.phone2,
          },
          expires_on: "2023-10-10",
          handle: `${Math.random()}`,
          location: data.location,
          platform: "SYSTEM",
        },
      }).then((e) => e.data.isSuccess),
  });
  const onSubmit = (data: z.TypeOf<typeof formSchema>) => {
    //
    addJobMutation
      .mutateAsync(data)
      .then((success) => {
        if (success) {
          toast.success("Added Job");
          reset({
            department: [],
            location: { name: "" },
            description: "",
            email: "",
            employer_name: "",
            phone1: "",
            phone2: "",
            title: "",
          });
          setIsOpen(false);
        } else throw new Error("Some error ocurred");
      })
      .catch(() => toast.error("Some error ocurred"));
  };
  return (
    <PopupDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add new job"
      containerClassName="overflow-visible"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 space-y-2 py-4">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-1 flex-col">
              <Input
                label="Title"
                placeholder="Title"
                className=" px-3 py-3"
                register={register}
                name="title"
                error={errors.title?.message}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <Input
                label="Description"
                placeholder="Description"
                className=" px-3 py-3"
                register={register}
                name="description"
                error={errors.description?.message}
              />
            </div>
          </div>
          <div className="flex flex-col gap-x-6 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Input
                label="Employer Name"
                placeholder="Employer Name"
                className="px-3 py-3"
                register={register}
                name="employer_name"
                error={errors.employer_name?.message}
              />
              <Input
                label="Email"
                placeholder="Email"
                type="email"
                className="px-3 py-3"
                register={register}
                name="email"
                error={errors.email?.message}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Input
                label="Phone 1"
                placeholder="Phone 1"
                className="px-3 py-3"
                register={register}
                name="phone1"
                error={errors.phone1?.message}
              />
              <Input
                label="Phone 2"
                placeholder="Phone 2"
                className="px-3 py-3"
                register={register}
                name="phone2"
                error={errors.phone2?.message}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-1 flex-col">
              <Controller
                control={control}
                name="department"
                render={({ field: { onChange, value } }) => (
                  <DepartmentSelector
                    selectedItems={value}
                    setSelectedItems={(valueFn) => {
                      if (typeof valueFn === "function") {
                        onChange(valueFn(value));
                      } else {
                        onChange(valueFn);
                      }
                    }}
                    error={errors.department?.message}
                  />
                )}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <LocationSelector
                    selected={value}
                    setSelected={(valueFn) => {
                      if (typeof valueFn === "function") {
                        onChange(valueFn(value));
                      } else {
                        onChange(valueFn);
                      }
                    }}
                    error={errors.location?.name?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={addJobMutation.isPending}
            disabled={addJobMutation.isPending}
            className="py-2"
          >
            Add Job
          </Button>
        </div>
      </form>
    </PopupDialog>
  );
};

//#endregion Add Job Popup

const formSchema = z.object({
  title: z.string().min(1, "Please enter job title"),
  description: z.string().min(1, "Please enter description"),
  employer_name: z.string().min(1, "Please enter employer name"),
  email: z.string().email(),
  phone1: z.string().min(1, "Please enter phone1"),
  phone2: z.string().min(1, "Please enter phone2"),
  department: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1),
      }),
    )
    .min(1, "Please Select at-least one department"),
  location: z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Please select location"),
  }),
});
