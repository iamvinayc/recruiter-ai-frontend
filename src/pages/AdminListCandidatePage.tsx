import { EyeIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Document, Page } from "react-pdf";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { z } from "zod";

import { Combobox } from "@/components/Combobox";
import { LineClamp } from "@/components/LineClamp";
import { LocationSelector } from "@/components/LocationSelector";
import { BlockButton } from "@/components/common/BlockButton";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES, SortBy } from "@/routes/routes";
import { ResumeFileUploadResponse, axiosApi } from "../api/api";
import { DepartmentSelector } from "../components/DepartmentSelector";
import { PopupDialog } from "../components/PopupDialog";
import { Button } from "../components/common/Button";
import { ChipGroup } from "../components/common/ChipGroup";
import { Input, TextArea } from "../components/common/Input";
import { cn, emptyArray, makeUrlWithParams, replaceWith } from "../utils";
import { EditCandidateDialog } from "./AdminListCandidatePage.dialogs";
import { ConfirmationDialog } from "./common/ConfirmationDialog";
import { DepartmentLocationScrapeFromSearch } from "./common/DepartmentLocationScrapeFromSearch";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const defaultArr: [] = [];

const columnHelper = createColumnHelper<CandidateListItem>();

export function AdminListCandidatePage() {
  const [
    {
      skill: department,
      location,
      scrape_from,
      sort_by,
      scrape_to,
      common,
      search,
      open_candidates,
      non_responsive_candidates,
      interview_scheduled_candidates,
      today_scrapped_candidates,
      responded_candidates,
      non_matched_candidates,
      final_followedup_candidates,
    },
    setTypeSearch,
  ] = useTypedSearchParams(ROUTES.ADMIN.LIST_CANDIDATE);
  const [{ id: candidateId }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_CANDIDATE,
  );
  const [showUserDetailsId, setShowUserDetailsId] = useState<number | null>(
    null,
  );
  const [showAddCandidatePopup, _setShowAddCandidatePopup] = useState(false);

  const handleFilterCommonCandidates = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTypeSearch((prevParams) => ({
      ...prevParams,
      common: event.target.checked ? "True" : "",
    }));
  };

  //#region query/mutation

  const candidateListQuery = useInfiniteQuery({
    queryKey: [
      "candidateListQuery",
      department,
      location,
      scrape_from,
      sort_by,
      common,
      search,
      candidateId,
      open_candidates,
      non_responsive_candidates,
      interview_scheduled_candidates,
      today_scrapped_candidates,
      responded_candidates,
      non_matched_candidates,
      final_followedup_candidates,
    ],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: replaceWith(
          candidateId
            ? makeUrlWithParams("data-sourcing/candidate/{{candidateId}}/", {
                candidateId: candidateId,
              })
            : "data-sourcing/candidate/",
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
          open_candidates: open_candidates || undefined,
          non_responsive_candidates: non_responsive_candidates || undefined,
          interview_scheduled_candidates:
            interview_scheduled_candidates || undefined,
          today_scrapped_candidates: today_scrapped_candidates || undefined,
          responded_candidates: responded_candidates || undefined,
          non_matched_candidates: non_matched_candidates || undefined,
          final_followedup_candidates: final_followedup_candidates || undefined,
        },
      }).then((e) => e.data),
    getNextPageParam(e) {
      return e.next;
    },
    initialPageParam: "",
  });
  const [editingUserId, setEditingUserId] = useState(-1);

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

  const blockCandidateMutation = useMutation({
    mutationKey: ["blockCandidateMutation"],
    mutationFn: async ({ blocked, id }: { id: number; blocked: boolean }) => {
      return axiosApi({
        url: replaceWith(
          "data-sourcing/candidate/block/:id/",
          "data-sourcing/candidate/block/:id/".replace(":id", id.toString()),
        ),
        method: "PATCH",
        params: undefined,
        data: {
          blocked,
        },
      })
        .then((e) => e.data.isSuccess)
        .then((success) => {
          if (success) candidateListQuery.refetch();
          return success;
        });
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
      columnHelper.display({
        id: "SLNo",
        header: "No",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("title", {
        header: "CANDIDATE",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("description", {
        header: "DESCRIPTION",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor("departments", {
        header: "SKILLS",
        cell: (info) => {
          return <ChipGroup items={info.getValue()} />;
        },
      }),
      columnHelper.accessor("location", {
        header: "PROVINCIE",
        cell: (info) => {
          return <ChipGroup items={info.getValue()} className="bg-[#55BCE7] text-nowrap" />;
        },
      }),
      columnHelper.accessor("city", {
        header: "LOCATION",
      }),
      // columnHelper.accessor("platform", {
      //   header: "Platform",
      //   cell: (info) => {
      //     return <div className="w-auto">{info.getValue()}</div>;
      //   },
      // }),
      columnHelper.display({
        header: "ACTION",
        id: "action",
        cell: (info) => {
          return (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setEditingUserId(info.row.original.id)}
                className="rounded-none bg-[#F6ea00] p-3 text-white hover:bg-opacity-70"
              >
                <Pencil className="h-4 w-4 " />
              </button>
              <button
                onClick={() => setShowUserDetailsId(info.row.original.id)}
                className="rounded-none bg-[#55BCE7] p-3 text-white hover:bg-opacity-70"
              >
                <EyeIcon className="h-4 w-4 " />
              </button>
              {info.row.original.platform === "SYSTEM" ? (
                <button
                  onClick={() => setShowUserDeleteId(info.row.original.id)}
                  className="rounded-none bg-red-500 p-3 text-white hover:bg-opacity-70"
                >
                  <TrashIcon className="h-4 w-4 " />
                </button>
              ) : null}
              <BlockButton
                isLoading={
                  blockCandidateMutation.variables?.id ===
                    info.row.original.id && blockCandidateMutation.isPending
                }
                onClick={() => {
                  blockCandidateMutation.mutateAsync({
                    id: info.row.original.id,
                    blocked: !info.row.original.is_blocked,
                  });
                }}
                is_blocked={info.row.original.is_blocked}
              />
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockCandidateMutation.variables?.id, blockCandidateMutation.isPending],
  );
  const candidateListQueryData = useMemo(
    () =>
      candidateListQuery?.data?.pages?.map((e) => e.data)?.flat() || defaultArr,
    [candidateListQuery?.data?.pages],
  );

  const candidateList = useMemo(
    () =>
      candidateListQueryData?.map<CandidateListItem>((e) => ({
        id: e.id,
        title: e.name,
        description: e.description || "",
        location: [{ id: e.location.id, name: e.location.name }],
        departments: e.departments.map((e) => ({ id: e.id, name: e.name })),
        platform: e.platform,
        city: e.city,
        is_blocked: e.is_blocked,
      })) || defaultArr,
    [candidateListQueryData],
  );
  const selectedUser = candidateListQueryData?.find(
    (e) => e.id === showUserDetailsId,
  );
  const editingUser = candidateListQueryData?.find(
    (e) => e.id === editingUserId,
  );

  //#endregion
  console.log("re-render");
  const table = useReactTable({
    columns: columns,
    data: candidateList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
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
          <h2 className="text-title-md2 font-semibold text-black dark:text-white uppercase">
            Candidates
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

            <label
              htmlFor="common-filter"
              className="inline-flex items-center text-lg font-semibold"
            >
              <input
                type="checkbox"
                id="common-filter"
                checked={common === "True"}
                onChange={handleFilterCommonCandidates}
                className="form-checkbox h-6 w-6 border-black accent-black focus:ring-0"
              />
              <span className="ml-2">Common Candidates</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAddCandidatePopup(true)}
              className="flex items-center gap-2 bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
            >
              <PlusIcon className="h-6 w-6 stroke-2" />
              Add Candidate
            </button>
          </div>
        </div>
        <DepartmentLocationScrapeFromSearch
          searchTitle="Candidate Name"
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
            <InfinityLoaderComponent
              dataLength={candidateListQueryData.length}
              hasMore={candidateListQuery.hasNextPage}
              next={() => {
                candidateListQuery.fetchNextPage();
              }}
            >
              <Table
                table={table}
                loader={
                  <TableLoader
                    colSpan={columns.length}
                    dataList={candidateList}
                    isLoading={candidateListQuery.isLoading}
                    isUpdateLoading={
                      candidateListQuery.isLoading ||
                      candidateListQuery.isRefetching
                    }
                  />
                }
              />
            </InfinityLoaderComponent>
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
                    ["Platform", selectedUser?.platform],
                  ]
                    .filter((e) => !!e[1])
                    .map(([key, value]) => (
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
                            rel="noreferrer"
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
      <EditCandidateDialog
        closeDialog={(success) => {
          setEditingUserId(-1);
          if (success) candidateListQuery.refetch();
        }}
        selectedUser={editingUser}
      />
    </main>
  );
}

//#region Table helper

interface CandidateListItem {
  id: number;
  title: string;
  description: string;

  departments: { id: number; name: string }[];
  location: { id: number; name: string }[];
  platform: string;
  city: string;
  is_blocked: boolean;
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
  const [showPreview, setShowPreview] = useState(false);
  const { isRecruiter } = useLogin();
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
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
    uploadResumeFile.reset();
  };
  const addCandidateMutation = useMutation({
    mutationKey: ["addCandidateMutation"],
    mutationFn: (
      data: z.TypeOf<typeof formSchema> & {
        resume_data?: ResumeFileUploadResponse;
      },
    ) =>
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
          location: {
            name: data.city,
          },
          platform: "SYSTEM",
          resume_data: data.resume_data,
        },
      }).then((e) => e.data),
  });

  const uploadResumeFile = useMutation({
    mutationKey: ["uploadResumeFile"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      return axiosApi({
        url: "data-sourcing/candidate/resume_upload/",
        method: "POST",
        data: formData,
      })
        .then((e) => e.data.data)
        .then(async (e) => {
          console.log(e);
          const email = e.resume_email;
          const phone = e.resume_phone;
          if (email) {
            setValue("email", email);
          }
          if (phone) {
            setValue("phone", phone);
          }
          const skills = e.resume_skills;
          if (skills) {
            setValue("department", skills);
          }
          setValue("resume_file", e.resume_file);
          console.log(skills);
          return e;
        });
    },
  });
  const onSubmit = (data: z.TypeOf<typeof formSchema>) => {
    const { resume_file, description, ...formData } = data;
    if (!resume_file && !description) {
      toast.error("Please upload resume or enter description");
      return;
    }
    //
    addCandidateMutation
      .mutateAsync({
        ...formData,
        description: description || undefined,
        resume_data: uploadResumeFile.data,
      })
      .then((data) => {
        if (data.isSuccess) {
          toast.success("Added candidate successfully");
          resetForm();
          setIsOpen(false);
        } else if (data.message) {
          toast.error(data.message);
          if (data.message.toLowerCase().includes("email")) {
            setError("email", { message: JSON.stringify(data.message) });
          }
        } else throw new Error("Some error ocurred");
      })
      .catch(() => toast.error("Some error ocurred"));
  };

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const [pdfPreviewURL, setPdfPreviewURL] = useState("");
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
                label="Candidate"
                placeholder="Candidate"
                className=" px-3 py-3"
                register={register}
                name="name"
                error={errors.name?.message}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <TextArea
                label={uploadResumeFile.data ? "Additional Details" : "Summary"}
                placeholder={
                  uploadResumeFile.data ? "Additional Details" : "Summary"
                }
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
              {/* <Input
                label="Resume url"
                placeholder="Resume url"
                className="px-3 py-3"
                register={register}
                name="resume_file"
                type="url"
                error={errors.resume_file?.message}
              /> */}
              <Input
                type="file"
                label="Upload Resume"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadResumeFile.mutateAsync(file);
                    setPdfPreviewURL(URL.createObjectURL(file));
                  }
                }}
                icon={
                  uploadResumeFile.isPending ? (
                    <SpinnerIcon className="m-0 mt-1 p-0 text-primary" />
                  ) : undefined
                }
                error={errors.resume_file?.message}
              />
              {uploadResumeFile.data ? (
                <button
                  type="button"
                  className="ml-2 text-primary underline"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </button>
              ) : null}
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

        {showPreview && (
          <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
            <div className=" relative max-h-full max-w-full overflow-auto rounded-lg bg-white p-4">
              <button
                className="text-gray-500 hover:text-gray-700 fixed right-4 top-4 z-10 rounded-full bg-white p-2"
                onClick={() => setShowPreview(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <Document file={pdfPreviewURL}>
                <Page pageNumber={1} />
              </Document>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <p className="text-gray-500 text-sm italic">
            Disclaimer:- Please update{" "}
            {uploadResumeFile.data ? (
              <span className="font-semibold">Additional Details</span>
            ) : (
              <span className="font-semibold">Summary</span>
            )}{" "}
            information section if any new information available from candidate.
            This will be used in scoring and rank calculation
          </p>
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
  description: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1, "Please enter phone"),
  profile_url: z.string(),
  resume_file: z.string().optional(),
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
