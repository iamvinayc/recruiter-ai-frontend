import { EyeIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
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
import { LineClamp } from "@/components/LineClamp";
import { ROUTES, SortBy } from "@/routes/routes";
import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input } from "../components/common/Input";
import { SpinnerIcon } from "../components/common/SvgIcons";
import { DepartmentSelector } from "../components/DepartmentSelector";
import { LocationSelector } from "../components/LocationSelector";
import { PopupDialog } from "../components/PopupDialog";
import { cn, emptyArray } from "../utils";
import { DepartmentLocationScrapeFromSearch } from "./common/DepartmentLocationScrapeFromSearch";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();

export function AdminListCandidatePage() {
  const [{ skill: department, location, scrape_from, sort_by }, setTypeSearch] =
    useTypedSearchParams(ROUTES.ADMIN.LIST_JOBS);
  const [showUserDetailsId, setShowUserDetailsId] = useState<number | null>(
    null,
  );
  const [showAddCandidatePopup, _setShowAddCandidatePopup] = useState(false);

  //#region query/mutation

  const candidateListQuery = useQuery({
    queryKey: [
      "candidateListQuery",
      department,
      location,
      scrape_from,
      sort_by,
    ],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/candidate/",
        method: "GET",
        params: {
          department: department || undefined,
          location: location || undefined,
          scrape_from: scrape_from || undefined,
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
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
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

  const candidateList = useMemo(
    () =>
      candidateListQuery.data?.map<Person>((e) => ({
        id: e.id,
        title: e.name,
        description: e.description || "",
        location: [{ id: e.location.id, name: e.location.name }],
        departments: e.departments.map((e) => ({ id: e.id, name: e.name })),
        platform: e.platform,
        city: e.city,
      })) || defaultArr,
    [candidateListQuery.data],
  );
  const selectedUser = candidateListQuery.data?.find(
    (e) => e.id === showUserDetailsId,
  );
  //#endregion

  const table = useReactTable({
    columns: columns,
    data: candidateList,
    getCoreRowModel: getCoreRowModel(),
  });
  const setShowAddCandidatePopup = (v: React.SetStateAction<boolean>) => {
    const value = typeof v === "function" ? v(showAddCandidatePopup) : v;
    _setShowAddCandidatePopup(value);
    if (value === false) candidateListQuery.refetch();
  };
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Candidate
          </h2>
          <div className="flex items-center space-x-2">
            <Combobox
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
              onClick={() => setShowAddCandidatePopup(true)}
              className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
            >
              <PlusIcon className="h-6 w-6 stroke-2" />
              Add Candidate
            </button>
          </div>
        </div>
        <DepartmentLocationScrapeFromSearch
          onSearch={() => {
            candidateListQuery.refetch();
          }}
        />

        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              candidateListQuery.isLoading && "min-h-[20rem]",
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
            {!candidateListQuery.isLoading && candidateList?.length === 0 && (
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

                candidateListQuery.isLoading || candidateListQuery.isRefetching
                  ? "flex"
                  : "hidden",
              )}
            >
              <SpinnerIcon className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
      </div>
      <AddCandidatePopup
        isOpen={showAddCandidatePopup}
        setIsOpen={setShowAddCandidatePopup}
      />
      <PopupDialog
        isOpen={showUserDetailsId !== null}
        setIsOpen={() => setShowUserDetailsId(null)}
        title="Candidate Details"
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
            <div>
              <div className="rounded-md border">
                <div className="flex items-center space-x-2 border-b p-4 py-3 text-lg font-medium">
                  {/* icon */}
                  <span>User Info</span>
                </div>
                <div className="divide-y">
                  {[
                    ["Name", selectedUser?.name],
                    ["Email", selectedUser?.email],
                    ["Phone", selectedUser?.phone],
                    ["Profile url", selectedUser?.profile_url],
                    ["Resume file", selectedUser?.resume_file],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col justify-between px-4 py-2 text-sm md:flex-row"
                    >
                      <div className="font-medium">{key}</div>
                      {value?.startsWith("https://") ? (
                        <a
                          href={value}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="truncate text-blue-500"
                        >
                          {value}
                        </a>
                      ) : (
                        <div className="truncate ">{value}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {([["Location", selectedUser?.location?.name]] as const).map(
                ([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="font-medium">{key}</div>
                    <div className="text-sm text-slate-700">{value}</div>
                  </div>
                ),
              )}
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

  departments: { id: number; name: string }[];
  location: { id: number; name: string }[];
  platform: string;
  city: string;
}

//#endregion
//#region dialog
const AddCandidatePopup = ({
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
        url: "data-sourcing/candidate/" as "data-sourcing/candidate",
        method: "POST",
        data: {
          name: data.name,
          description: data.description,
          email: data.email,
          phone: data.phone,
          profile_url: data.profile_url,
          resume_file: data.resume_file,
          departments: data.department.map((e) => ({
            ...e,
            description: e.name,
          })),
          handle: `${Math.random()}`,
          city: data.location.name,
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
            name: "",
            description: "",
            email: "",
            phone: "",
            profile_url: "",
            resume_file: "",
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
      title="Add new candidate"
      containerClassName="overflow-visible"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 space-y-2 py-4">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-1 flex-col">
              <Input
                label="Candidate Name"
                placeholder="Candidate Name"
                className=" px-3 py-3"
                register={register}
                name="name"
                error={errors.name?.message}
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
                label="Email"
                placeholder="Email"
                type="email"
                className="px-3 py-3"
                register={register}
                name="email"
                error={errors.email?.message}
              />
              <Input
                label="Phone"
                placeholder="Phone "
                className="px-3 py-3"
                register={register}
                name="phone"
                error={errors.phone?.message}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Input
                label="Profile url"
                placeholder="Profile url"
                className="px-3 py-3"
                register={register}
                name="profile_url"
                error={errors.profile_url?.message}
              />
              <Input
                label="Resume file"
                placeholder="Resume file"
                className="px-3 py-3"
                register={register}
                name="resume_file"
                error={errors.resume_file?.message}
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
            Add Candidate
          </Button>
        </div>
      </form>
    </PopupDialog>
  );
};
//#endregion dialog

const formSchema = z.object({
  name: z.string().min(1, "Please enter candidate name"),
  description: z.string().min(1, "Please enter description"),
  email: z.string().email(),
  phone: z.string().min(1, "Please enter phone"),
  profile_url: z.string().min(1, "Please enter profile url"),
  resume_file: z.string().min(1, "Please enter resume file"),
  department: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1),
      }),
    )
    .min(1, "Please Select at-least one skills"),
  location: z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Please select location"),
  }),
});
