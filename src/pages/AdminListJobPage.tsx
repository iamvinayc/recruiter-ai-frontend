import { EyeIcon, XMarkIcon } from "@heroicons/react/20/solid";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { NotebookTabs, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { z } from "zod";

import { Combobox } from "@/components/Combobox";
import { LocationSelector } from "@/components/LocationSelector";
import { useLogin } from "@/hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { axiosApi } from "../api/api";
import { DepartmentSelector } from "../components/DepartmentSelector";
import { LineClamp } from "../components/LineClamp";
import { PopupDialog } from "../components/PopupDialog";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input, TextArea } from "../components/common/Input";
import { ROUTES, SortBy } from "../routes/routes";
import {
  cn,
  emptyArray,
  makeUrlWithParams,
  removeEmptyKeys,
  replaceWith,
} from "../utils";
import { JobRegisterDialog } from "./AdminListJobPage.dialog";
import { ConfirmationDialog } from "./common/ConfirmationDialog";
import { DepartmentLocationScrapeFromSearch } from "./common/DepartmentLocationScrapeFromSearch";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<Person>();

export function AdminListJobPage() {
  const [showAddJobPopup, _setShowAddJobPopup] = useState(false);
  const [showUserDetailsId, setShowUserDetailsId] = useState<number | null>(
    null,
  );
  const [
    {
      skill: department,
      location,
      scrape_from,
      scrape_to,
      sort_by,
      common,
      search,
      job_id: selectedJobId,
      id: jobId,
      open_jobs,
      non_responsive_jobs,
      interview_scheduled_jobs,
      today_scrapped_jobs,
    },
    setTypeSearch,
  ] = useTypedSearchParams(ROUTES.ADMIN.LIST_JOBS);
  // const [selectedJobId, setSelectedJobId] = useState("");
  const setSelectedJobId = (id: string) =>
    setTypeSearch((prev) => removeEmptyKeys({ ...prev, job_id: id }));
  const handleFilterCommonJobs = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTypeSearch((prevParams) => ({
      ...prevParams,
      common: event.target.checked ? "True" : "",
    }));
  };
  const navigate = useNavigate();

  //#region query/mutation

  const jobListQuery = useInfiniteQuery({
    queryKey: [
      "jobListQuery",
      department,
      location,
      scrape_from,
      scrape_to,
      sort_by,
      common,
      search,
      jobId,
      open_jobs,
      non_responsive_jobs,
      interview_scheduled_jobs,
      today_scrapped_jobs,
    ],
    queryFn: async ({ pageParam }) => {
      return axiosApi({
        url: replaceWith(
          jobId
            ? makeUrlWithParams("data-sourcing/job/{{jobId}}/", {
                jobId: jobId,
              })
            : "data-sourcing/job/",
          pageParam,
        ),
        method: "GET",
        params: {
          department: department || undefined,
          location: location || undefined,
          from_date: scrape_from || undefined,
          to_date: scrape_to || undefined,
          sort: sort_by || undefined,
          common: common || undefined,
          search: search || undefined,
          open_jobs: open_jobs || undefined,
          non_responsive_jobs: non_responsive_jobs || undefined,
          interview_scheduled_jobs: interview_scheduled_jobs || undefined,
          today_scrapped_jobs: today_scrapped_jobs || undefined,
        },
      }).then((e) => e.data);
    },
    getNextPageParam(e) {
      return e.next;
    },
    initialPageParam: "",
  });
  const [showJobDeleteId, setShowJobDeleteId] = useState<number | null>(null);

  const candidateDeleteMutation = useMutation({
    mutationKey: ["candidateDeleteMutation", showJobDeleteId],
    mutationFn: async () => {
      return axiosApi({
        url: `data-sourcing/job/${showJobDeleteId}/` as `data-sourcing/job//`,
        method: "DELETE",
      }).then((e) => e.data);
    },
  });

  const onJobDelete = () => {
    if (!showJobDeleteId)
      return console.log("No user to delete", showJobDeleteId);
    candidateDeleteMutation
      .mutateAsync()
      .then((data) => {
        if (data.isSuccess) {
          toast.success("Job deleted successfully");
          setShowJobDeleteId(null);
          jobListQuery.refetch();
        } else if (data.message) {
          toast.error(data.message);
        } else throw new Error("Some error ocurred");
      })
      .catch(() => toast.error("Some error ocurred"));
  };
  //#endregion

  console.log("re-render");

  //#region memo states

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "SLNo",
        header: "No",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("title", {
        header: "Position",
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
        header: "Company",
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
          return <ChipGroup items={info.getValue()} className="bg-[#55BCE7]" />;
        },
      }),
      columnHelper.accessor("city", {
        header: "Provincie",
        cell: (info) => {
          return <div className="w-auto">{info.getValue()}</div>;
        },
      }),
      // columnHelper.accessor("platform", {
      //   header: "Platform",
      //   cell: (info) => {
      //     return <div className="w-auto">{info.getValue()}</div>;
      //   },
      // }),
      columnHelper.display({
        header: "Action",
        id: "action",
        cell: (info) => {
          return (
            <div className="flex items-center space-x-2">
              <button
                className={cn(
                  "rounded-none bg-primary p-3 text-white hover:bg-opacity-70 ",
                )}
                title="Job Register"
                onClick={() => {
                  setSelectedJobId(info.row.original.id.toString());
                }}
              >
                <NotebookTabs className="h-5 w-5 " strokeWidth={3} />
              </button>
              <button
                onClick={() => setShowUserDetailsId(info.row.original.id)}
                className="rounded-none bg-primary p-3 text-white hover:bg-opacity-70"
              >
                <EyeIcon className="h-5 w-5 " />
              </button>
              {info.row.original.platform === "SYSTEM" ? (
                <button
                  onClick={() => setShowJobDeleteId(info.row.original.id)}
                  className="rounded-none bg-red-500 p-3 text-white hover:bg-opacity-70"
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

  const jobListQueryData = useMemo(
    () => jobListQuery?.data?.pages?.map((e) => e.data)?.flat() || defaultArr,
    [jobListQuery?.data?.pages],
  );

  const jobList = useMemo(
    () =>
      jobListQueryData.map<Person>((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        location: [{ id: e.location.id, name: e.location.name }],
        departments: e.departments.map((e) => ({ id: e.id, name: e.name })),
        employer: e.employer.employer_label,
        platform: e.platform,
        city: e.city,
      })),
    [jobListQueryData],
  );
  console.log("re-render");

  //#endregion

  const table = useReactTable({
    columns: columns,
    data: jobList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });
  const setShowAddJobPopup = (v: React.SetStateAction<boolean>) => {
    const value = typeof v === "function" ? v(showAddJobPopup) : v;
    _setShowAddJobPopup(value);
    if (value === false) jobListQuery.refetch();
  };

  const selectedUser = jobListQueryData?.find(
    (e) => e.id === showUserDetailsId,
  );

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Jobs
          </h2>
          <div className="flex items-center space-x-4">
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

            <label
              htmlFor="common-filter"
              className="inline-flex items-center text-lg font-semibold"
            >
              <input
                type="checkbox"
                id="common-filter"
                checked={common === "True"}
                onChange={handleFilterCommonJobs}
                className="form-checkbox h-6 w-6 rounded border-black accent-black focus:ring-0"
              />
              <span className="ml-2">Common Jobs</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAddJobPopup(true)}
              className="flex items-center gap-2 rounded-none bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
            >
              <PlusIcon className="h-6 w-6 stroke-2" />
              Add Job
            </button>
          </div>
        </div>
        <DepartmentLocationScrapeFromSearch
          searchTitle="Position"
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
            <InfinityLoaderComponent
              dataLength={jobList.length}
              hasMore={jobListQuery.hasNextPage}
              next={() => {
                jobListQuery.fetchNextPage();
              }}
            >
              <Table
                table={table}
                loader={
                  <TableLoader
                    colSpan={columns.length}
                    dataList={jobList}
                    isLoading={jobListQuery.isLoading}
                    isUpdateLoading={
                      jobListQuery.isLoading || jobListQuery.isRefetching
                    }
                  />
                }
              />
            </InfinityLoaderComponent>
          </div>
        </div>
      </div>
      <AddJobPopup isOpen={showAddJobPopup} setIsOpen={setShowAddJobPopup} />
      <ConfirmationDialog
        subtitle={
          <>
            Are you sure you want to delete the job{" "}
            <b>"{jobList.find((e) => e.id == showJobDeleteId)?.title}"</b> ?
          </>
        }
        closeDialog={() => setShowJobDeleteId(null)}
        isOpen={showJobDeleteId !== null}
        onDelete={onJobDelete}
        isDeleteLoading={candidateDeleteMutation.isPending}
      />
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
                    <span>Company Info</span>
                  </div>
                  <div className="divide-y">
                    {[
                      ["Employer Name", selectedUser?.employer?.employer_label],
                      ["Email", selectedUser?.employer?.email],
                      ["Contact Number", selectedUser?.employer?.phone1],
                      ["Alternate Number", selectedUser?.employer?.phone2],
                      ["Platform", selectedUser?.platform],
                    ]
                      .filter(([key], _, arr) => {
                        const phone2 = arr.find(
                          ([key]) => key === "Alternate Number",
                        )?.[1];
                        const phone1 = arr.find(
                          ([key]) => key === "Contact Number",
                        )?.[1];
                        if (phone2 === phone1 && key === "Alternate Number") {
                          return false;
                        }
                        return true;
                      })
                      .map(([key, value]) => (
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
      <JobRegisterDialog
        selectedJobId={selectedJobId}
        closeDialog={() => navigate(-1)}
      />
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
  const resetForm = () => {
    reset({
      city: "",
      department: [],
      description: "",
      email: "",
      employer_name: "",
      phone1: "",
      phone2: "",
      title: "",
    });
  };
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
          location: {
            name: data.city,
          },
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
          resetForm();
          setIsOpen(false);
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
      title="Add new job"
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
                label="Position"
                placeholder="Position"
                className=" px-3 py-3"
                register={register}
                name="title"
                error={errors.title?.message}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <TextArea
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
                label="Company"
                placeholder="Company"
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
                label="Contact Number"
                placeholder="Contact Number"
                className="px-3 py-3"
                register={register}
                name="phone1"
                error={errors.phone1?.message}
              />
              <Input
                label="Alternate Number"
                placeholder="Alternate Number"
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

const formSchema = z
  .object({
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
  })
  .refine((data) => data.phone1 !== data.phone2, {
    path: ["phone2"],
    message: "Alternate number should be different from contact number",
  });
