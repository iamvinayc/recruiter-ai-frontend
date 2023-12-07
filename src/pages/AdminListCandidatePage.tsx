import { EyeIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TrashIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { z } from "zod";

import { Combobox } from "@/components/Combobox";
import { LineClamp } from "@/components/LineClamp";
import { LocationSelector } from "@/components/LocationSelector";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES, SortBy } from "@/routes/routes";
import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input } from "../components/common/Input";
import { SpinnerIcon } from "../components/common/SvgIcons";
import { DepartmentSelector } from "../components/DepartmentSelector";
import { PopupDialog } from "../components/PopupDialog";
import { cn, emptyArray } from "../utils";
import { ConfirmationDialog } from "./common/ConfirmationDialog";
import { DepartmentLocationScrapeFromSearch } from "./common/DepartmentLocationScrapeFromSearch";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();

export function AdminListCandidatePage() {
  const [
    { skill: department, location, scrape_from, sort_by, scrape_to },
    setTypeSearch,
  ] = useTypedSearchParams(ROUTES.ADMIN.LIST_JOBS);
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
          from_date: scrape_from || undefined,
          to_date: scrape_to || undefined,
          sort: sort_by || undefined,
        },
      }).then((e) => e.data.data),
  });
  const [showUserDeleteId, setShowUserDeleteId] = useState<number | null>(null);

  const candidateDeleteMutation = useMutation({
    mutationKey: ["candidateDeleteMutation", showUserDeleteId],
    mutationFn: async () => {
      return axiosApi({
        url: `data-sourcing/candidate/${showUserDeleteId}/` as `data-sourcing/candidate//`,
        method: "DELETE",
      }).then((e) => e.data);
    },
  });

  const onUserDelete = () => {
    if (!showUserDeleteId)
      return console.log("No user to delete", showUserDeleteId);
    candidateDeleteMutation
      .mutateAsync()
      .then((data) => {
        if (data.isSuccess) {
          toast.success("Candidate deleted successfully");
          setShowUserDeleteId(null);
          candidateListQuery.refetch();
        } else if (data.message) {
          toast.error(data.message);
        } else throw new Error("Some error ocurred");
      })
      .catch(() => toast.error("Some error ocurred"));
  };
  //#endregion

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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUserDetailsId(info.row.original.id)}
                className="rounded-md bg-primary p-3 text-white hover:bg-opacity-70"
              >
                <EyeIcon className="h-4 w-4 " />
              </button>
              {info.row.original.platform === "SYSTEM" ? (
                <button
                  onClick={() => setShowUserDeleteId(info.row.original.id)}
                  className="rounded-md bg-red-500 p-3 text-white hover:bg-opacity-70"
                >
                  <TrashIcon className="h-4 w-4 " />
                </button>
              ) : null}
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
      <ConfirmationDialog
        subtitle={
          <>
            Are you sure you want to delete the candidate{" "}
            <b>
              "{candidateList.find((e) => e.id == showUserDeleteId)?.title}"
            </b>{" "}
            ?
          </>
        }
        closeDialog={() => setShowUserDeleteId(null)}
        isOpen={showUserDeleteId !== null}
        onDelete={onUserDelete}
        isDeleteLoading={candidateDeleteMutation.isPending}
      />
      {/* <PopupDialog
        isOpen={showUserDeleteId !== null}
        setIsOpen={() => setShowUserDeleteId(null)}
        title="Conformation"
        containerClassName="max-w-[95%] md:max-w-[50%] "
      >
        <Dialog.Title className="mb-8 mt-4">
          Are you sure you wan to delete the candidate{" "}
          <b>"{candidateList.find((e) => e.id == showUserDeleteId)?.title}"</b>{" "}
          ?
        </Dialog.Title>
        <div className=" flex items-center justify-end space-x-2">
          <Button
            type="button"
            onClick={() => setShowUserDeleteId(null)}
            className="border-none bg-slate-200 py-2 text-black outline-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setShowUserDeleteId(null)}
            className="border-none bg-red-500 py-2 outline-red-300"
          >
            Delete
          </Button>
        </div>
      </PopupDialog> */}
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
  const { isRecruiter } = useLogin();
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    reset,
    setError,
  } = useForm<z.TypeOf<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: [],
      city: "",
    },
  });
  const resetForm = () => {
    reset({
      department: [],
      city: "",
      name: "",
      description: "",
      email: "",
      phone: "",
      profile_url: "",
      resume_file: "",
    });
  };
  const addCandidateMutation = useMutation({
    mutationKey: ["addCandidateMutation"],
    mutationFn: (data: z.TypeOf<typeof formSchema>) =>
      axiosApi({
        url: "data-sourcing/candidate/" as "data-sourcing/candidate",
        method: "POST",
        data: {
          name: data.name,
          description: data.description,
          email: data.email,
          phone: data.phone,
          profile_url: data.profile_url || null,
          resume_file: data.resume_file || null,
          departments: data.department.map((e) => ({
            ...e,
            description: e.name,
          })),
          handle: `${Math.random()}`,
          city: data.city,
          platform: "SYSTEM",
        },
      }).then((e) => e.data),
  });
  const onSubmit = (data: z.TypeOf<typeof formSchema>) => {
    //
    addCandidateMutation
      .mutateAsync(data)
      .then((data) => {
        if (data.isSuccess) {
          toast.success("Added candidate successfully");
          resetForm();
          setIsOpen(false);
        } else if (data.message) {
          toast.error(data.message);
          if (data.message.toLowerCase().includes("email")) {
            setError("email", { message: data.message });
          }
        } else throw new Error("Some error ocurred");
      })
      .catch(() => toast.error("Some error ocurred"));
  };

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  return (
    <PopupDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add new candidate"
      containerClassName="overflow-visible relative"
    >
      <button
        className="absolute right-0 top-0 p-4 outline-none ring-0"
        onClick={() => setIsOpen(false)}
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
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
                type="url"
                error={errors.profile_url?.message}
              />
              <Input
                label="Resume url"
                placeholder="Resume url"
                className="px-3 py-3"
                register={register}
                name="resume_file"
                type="url"
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
                      error={errors.city?.message?.replace("city", "location")}
                    />
                  )}
                />
              ) : (
                <Input
                  register={register}
                  name="city"
                  label="Location"
                  placeholder="Location"
                  error={errors.city?.message?.replace("city", "location")}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="reset"
            onClick={resetForm}
            className="border-slate-400 bg-slate-400 p-4  py-2 outline-slate-500"
          >
            Reset
          </Button>
          <Button type="submit" className="py-2">
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
  profile_url: z.string(),
  resume_file: z.string(),
  department: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1),
      }),
    )
    .min(1, "Please Select at-least one skills"),
  city: z.string().min(1, "Please enter a city"),
});
