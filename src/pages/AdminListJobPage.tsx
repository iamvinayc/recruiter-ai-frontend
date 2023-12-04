import { EyeIcon, XMarkIcon } from "@heroicons/react/20/solid";
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

import { Combobox } from "@/components/Combobox";
import { LocationSelector } from "@/components/LocationSelector";
import { useLogin } from "@/hooks/useLogin";
import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input } from "../components/common/Input";
import { SpinnerIcon } from "../components/common/SvgIcons";
import { DepartmentSelector } from "../components/DepartmentSelector";
import { LineClamp } from "../components/LineClamp";
import { PopupDialog } from "../components/PopupDialog";
import { ROUTES, SortBy } from "../routes/routes";
import { cn, emptyArray } from "../utils";
import { DepartmentLocationScrapeFromSearch } from "./common/DepartmentLocationScrapeFromSearch";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();

export function AdminListJobPage() {
  const [showAddJobPopup, _setShowAddJobPopup] = useState(false);
  const [showUserDetailsId, setShowUserDetailsId] = useState<number | null>(
    null,
  );
  const [
    { skill: department, location, scrape_from, scrape_to, sort_by },
    setTypeSearch,
  ] = useTypedSearchParams(ROUTES.ADMIN.LIST_JOBS);

  //#region query/mutation

  const jobListQuery = useQuery({
    queryKey: [
      "jobListQuery",
      department,
      location,
      scrape_from,
      scrape_to,
      sort_by,
    ],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/job/",
        method: "GET",
        params: {
          department: department || undefined,
          location: location || undefined,
          from_date: scrape_from || undefined,
          to_date: scrape_to || undefined,
          sort: sort_by || undefined,
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
        cell: (info) => (
          <div className="max-w-[150px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <div className="max-w-[150px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("employer", {
        header: "Employer",
        cell: (info) => (
          <div className="max-w-[150px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("departments", {
        header: "Skills",
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
      columnHelper.accessor("city", {
        header: "City",
        cell: (info) => {
          return <div className="w-auto">{info.getValue()}</div>;
        },
      }),
      columnHelper.accessor("platform", {
        header: "Platform",
        cell: (info) => {
          return <div className="w-auto">{info.getValue()}</div>;
        },
      }),
      columnHelper.display({
        header: "Action",
        id: "action",
        cell: (info) => {
          return (
            <div className="">
              <button
                onClick={() => setShowUserDetailsId(info.row.original.id)}
                className="rounded-md bg-primary p-3 text-white hover:bg-opacity-70"
              >
                <EyeIcon className="h-5 w-5 " />
              </button>
            </div>
          );
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
        platform: e.platform,
        city: e.city,
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

  const selectedUser = jobListQuery.data?.find(
    (e) => e.id === showUserDetailsId,
  );
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Jobs
          </h2>
          <div className="flex items-center space-x-2">
            <Combobox
              className="w-[200px]"
              items={Object.entries(SortBy).map(([key, value]) => ({
                label: key,
                value,
              }))}
              label=""
              placeholder={`Sort By: Alphabetical`}
              selectedValue={sort_by}
              setSelectedValue={(e) => {
                if (typeof e === "function") {
                  setTypeSearch((prev) => ({
                    ...prev,
                    sort_by: e(prev.sort_by),
                  }));
                } else {
                  setTypeSearch((prev) => ({ ...prev, sort_by: e }));
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowAddJobPopup(true)}
              className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
            >
              <PlusIcon className="h-6 w-6 stroke-2" />
              Add Job
            </button>
          </div>
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
            <table className={cn("min-w-full   table-fixed overflow-scroll")}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        className={cn(
                          "border-b border-slate-200 p-4 pb-3 pl-8  text-left font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200",
                          header.id === "platform" && "w-[140px]",
                          header.id === "action" && "w-[140px]",
                        )}
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
      <PopupDialog
        isOpen={showUserDetailsId !== null}
        setIsOpen={() => setShowUserDetailsId(null)}
        title="Job Details"
        containerClassName="max-w-[95%] md:max-w-[70%] "
      >
        <div>
          <button
            className="absolute right-0 top-0 p-4"
            onClick={() => setShowUserDetailsId(null)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div className="mt-4 grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-2">
            <div className="space-y-4">
              {(
                [
                  ["Job Title", selectedUser?.title],
                  ["Location", selectedUser?.location?.name],
                ] as const
              ).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium">{key}</div>
                  <div className="text-sm text-slate-700">{value}</div>
                </div>
              ))}
              <div className="space-y-1">
                <div className="font-medium">Skills</div>
                <div className="text-sm ">
                  <ChipGroup
                    items={selectedUser?.departments || emptyArray}
                    showAll
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Description</div>
                <div className="text-sm text-slate-700">
                  <LineClamp text={selectedUser?.description || ""} />
                </div>
              </div>
            </div>
            <div className=" ">
              <div>
                <div className="rounded-md border">
                  <div className="flex items-center space-x-2 border-b p-4 py-3 text-lg font-medium">
                    {/* icon */}
                    <span>Employer Info</span>
                  </div>
                  <div className="divide-y">
                    {[
                      ["Employee Name", selectedUser?.employer?.employer_label],
                      ["Email", selectedUser?.employer?.email],
                      ["Phone 1", selectedUser?.employer?.phone1],
                      ["Phone 2", selectedUser?.employer?.phone2],
                    ].map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between px-4 py-2 text-sm"
                      >
                        <div className="font-medium">{key}</div>
                        <div>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopupDialog>
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
  platform: string;
  city: string;
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
  const { isRecruiter } = useLogin();

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
      city: "",
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
            phone2: data.phone2 || null,
          },
          expires_on: "2023-10-10",
          handle: `${Math.random()}`,
          city: data.city,
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
            city: "",
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
              {isRecruiter ? (
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <LocationSelector
                      selected={{ name: value }}
                      setSelected={(valueFn) => {
                        if (typeof valueFn === "function") {
                          onChange(valueFn({ name: value }).name);
                        } else {
                          onChange(valueFn.name);
                        }
                      }}
                      error={errors.city?.message}
                    />
                  )}
                />
              ) : (
                <Input
                  register={register}
                  name="city"
                  label="City"
                  placeholder="City"
                  error={errors.city?.message}
                />
              )}
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
  phone2: z.string(),
  department: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1),
      }),
    )
    .min(1, "Please Select at-least one skill"),
  city: z.string().min(1, "Please enter a city"),
});
