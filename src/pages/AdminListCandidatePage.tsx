import { PlusIcon } from "@heroicons/react/20/solid";
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

import { ROUTES } from "@/routes/routes";
import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input } from "../components/common/Input";
import { SpinnerIcon } from "../components/common/SvgIcons";
import { DepartmentSelector } from "../components/DepartmentSelector";
import { LocationSelector } from "../components/LocationSelector";
import { PopupDialog } from "../components/PopupDialog";
import { cn } from "../utils";
import { DepartmentLocationScrapeFromSearch } from "./common/DepartmentLocationScrapeFromSearch";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();

export function AdminListCandidatePage() {
  const [{ department, location, scrape_from }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_JOBS,
  );
  const [showAddCandidatePopup, _setShowAddCandidatePopup] = useState(false);

  //#region query/mutation

  const candidateListQuery = useQuery({
    queryKey: ["candidateListQuery", department, location, scrape_from],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/candidate/",
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

  const candidateList = useMemo(
    () =>
      candidateListQuery.data?.map<Person>((e) => ({
        id: e.id,
        title: e.name,
        description: e.description || "",
        location: [{ id: e.location.id, name: e.location.name }],
        departments: e.departments.map((e) => ({ id: e.id, name: e.name })),
      })) || defaultArr,
    [candidateListQuery.data],
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
          <button
            type="button"
            onClick={() => setShowAddCandidatePopup(true)}
            className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
          >
            <PlusIcon className="h-6 w-6 stroke-2" />
            Add Candidate
          </button>
        </div>
        <DepartmentLocationScrapeFromSearch
          onSearch={() => {
            candidateListQuery.refetch();
          }}
        />

        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark",
              candidateListQuery.isLoading && "min-h-[20rem]",
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
    .min(1, "Please Select at-least one department"),
  location: z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Please select location"),
  }),
});
