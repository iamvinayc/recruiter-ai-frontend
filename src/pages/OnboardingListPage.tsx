import { OnboardingStatus, axiosApi, formatOnboardingStatus } from "@/api/api";
import { cn, replaceWith } from "@/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import { Check, ChevronsUpDown, Edit2Icon } from "lucide-react";
import { PopupDialog } from "@/components/PopupDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button as Btn } from "@/components/common/Button";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/common/Input";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useLogin } from "@/hooks/useLogin";
import { match, P } from "ts-pattern";
interface OnboardingList {
  id: number;
  job_name: string;
  employer_name: string;
  candidate_name: string;
  status: string;
  updated_at: string;
  is_editable: boolean;
}
const columnHelper = createColumnHelper<OnboardingList>();

const STATUS_NOT_EDITABLE = [
  OnboardingStatus.PLACED,
  OnboardingStatus.REJECTED,
  OnboardingStatus.CANCELLED,
  OnboardingStatus.EMPLOYER_FEEDBACK_SUBMITTED,
  OnboardingStatus.CANDIDATE_FEEDBACK_SUBMITTED,
] as string[];

const STATUS_ORDER = [
  OnboardingStatus.SHORTLISTED,
  OnboardingStatus.RECRUITER_INTERVIEWED,
  OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_VIDEO,
  OnboardingStatus.EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO,
  OnboardingStatus.EMPLOYER_INTERVIEWED_VIDEO,
  OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_F2F,
  OnboardingStatus.EMPLOYER_INTERVIEW_RESCHEDULED_F2F,
  OnboardingStatus.EMPLOYER_INTERVIEWED_F2F,
  OnboardingStatus.EMPLOYER_SELECTED,
  OnboardingStatus.PLACED,
] as string[];
const ALWAYS_SHOW_STATUS = [
  OnboardingStatus.REJECTED,
  OnboardingStatus.CANCELLED,
] as string[];
const EXTRA_MAPPINGS_OPTIONS = {
  [OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_VIDEO]: [
    OnboardingStatus.EMPLOYER_INTERVIEWED_VIDEO,
    OnboardingStatus.EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO,
  ],
  [OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_F2F]: [
    OnboardingStatus.EMPLOYER_INTERVIEWED_F2F,
    OnboardingStatus.EMPLOYER_INTERVIEW_RESCHEDULED_F2F,
  ],
} as {
  [key: string]: string[];
};
export default function OnboardingListPage() {
  const [selectedOnboardingId, setSelectedOnboardingId] = useState<
    number | null
  >(null);
  const { isRecruiter } = useLogin();
  const onboardingListingQuery = useInfiniteQuery({
    queryKey: ["onboardingListingQuery"],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: replaceWith("onboarding/employee_onboarding/", pageParam),
        method: "GET",
      }).then((e) => e.data),
    getNextPageParam(e) {
      return e.next;
    },
    initialPageParam: "",
  });

  const onboardingList = useMemo(
    () =>
      onboardingListingQuery?.data?.pages
        ?.map((e) => e?.data)
        ?.flat()
        ?.map<OnboardingList>((e) => ({
          id: e.id,
          job_name: e.job.title,
          employer_name: e.employer.employer_label,
          candidate_name: e.candidate.name,
          status: e.status,
          updated_at: e.updated_at,
          is_editable: e.is_editable,
        })) || [],
    [onboardingListingQuery.data],
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor("job_name", {
        header: "Job Title",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("employer_name", {
        header: "Employer Name",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("candidate_name", {
        header: "Candidate Name",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <div
            className="flex items-center space-x-3 truncate"
            title={formatOnboardingStatus(info.getValue())}
          >
            <span
              className={cn(
                "relative grid select-none items-center whitespace-nowrap rounded-lg  px-3 py-1.5 font-sans text-xs font-bold text-white",
                info.getValue() === OnboardingStatus.CANCELLED ||
                  info.getValue() === OnboardingStatus.REJECTED
                  ? "bg-red-500"
                  : info.getValue() === OnboardingStatus.EMPLOYER_SELECTED
                  ? "bg-green-500"
                  : "bg-blue-500",
              )}
            >
              {formatOnboardingStatus(info.getValue())}
            </span>
            {match(info.row.original.status)
              .with(
                P.when((arg) => STATUS_NOT_EDITABLE.includes(arg)),
                () => false,
              )
              .with(OnboardingStatus.SHORTLISTED, () => true)
              .otherwise(() =>
                isRecruiter ? info.row.original.is_editable : true,
              ) ? (
              <button
                className={cn(
                  "rounded-md bg-primary p-2 text-white hover:bg-opacity-70",
                )}
                onClick={() => setSelectedOnboardingId(info.row.original.id)}
              >
                <Edit2Icon size={16} strokeWidth={3} />
              </button>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("updated_at", {
        header: "Updated at",
        cell: (info) => (
          <div className="  truncate" title={info.getValue()}>
            {dayjs(info.getValue()).format("DD/MM/YYYY HH:mm:ss")}
          </div>
        ),
      }),
    ],
    [isRecruiter],
  );

  const table = useReactTable({
    columns: columns,
    data: onboardingList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });
  const selectedValue = onboardingList.find((e) => selectedOnboardingId == e.id)
    ?.status;
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Onboarding List
          </h2>
        </div>
        {/* -- Body --- */}
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              onboardingListingQuery.isLoading && "min-h-[20rem]",
            )}
          >
            <InfinityLoaderComponent
              dataLength={onboardingList.length}
              hasMore={onboardingListingQuery.hasNextPage}
              next={() => {
                onboardingListingQuery.fetchNextPage();
              }}
            >
              <Table
                table={table}
                loader={
                  <TableLoader
                    colSpan={columns.length}
                    dataList={onboardingList}
                    isLoading={onboardingListingQuery.isLoading}
                    isUpdateLoading={
                      onboardingListingQuery.isLoading ||
                      onboardingListingQuery.isRefetching
                    }
                  />
                }
              />
            </InfinityLoaderComponent>
          </div>
        </div>
        {/* -- Body --- */}
        <PopupDialog
          isOpen={selectedOnboardingId != null}
          setIsOpen={() => setSelectedOnboardingId(null)}
          title="Edit Status"
          showXMarkIcon
        >
          <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto ">
            <UpdateStatusModal
              selectedOnboardingId={selectedOnboardingId}
              refresh={() => onboardingListingQuery.refetch()}
              selectedValue={selectedValue}
              onDismiss={() => setSelectedOnboardingId(null)}
            />
          </div>
        </PopupDialog>
      </div>
    </main>
  );
}

export function UpdateStatusModal({
  selectedOnboardingId,
  refresh,
  selectedValue: _selectedValue,
  onDismiss,
}: {
  selectedOnboardingId: number | null;
  refresh: VoidFunction;
  selectedValue?: string;
  onDismiss: VoidFunction;
}) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const {
    register,
    formState: { errors },
    handleSubmit,
    trigger,
    control,
    setValue,
  } = useForm<z.TypeOf<typeof fromState>>({
    resolver: zodResolver(fromState),
  });
  useEffect(() => {
    if (_selectedValue) {
      setSelectedValue(_selectedValue);
      setValue("status", _selectedValue);
      trigger("status");
    }
    return () => setSelectedValue("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_selectedValue]);

  const updateStatusMutation = useMutation({
    mutationKey: ["updateStatus", selectedOnboardingId],
    mutationFn: async (data: {
      status: OnboardingStatus;
      reason_for_rejection?: string;
      video_interview_on?: string;
      f2f_interview_on?: string;
    }) => {
      return axiosApi({
        url: "onboarding/status/{id}/".replace(
          "{id}",
          `${selectedOnboardingId}`,
        ) as "onboarding/status/{id}/",
        method: "PUT",
        data: data,
      }).then((e) => e.data);
    },
  });
  const onSubmit = (fromValue: z.TypeOf<typeof fromState>) => {
    const found = STATUSES.find(
      (status) => status.value?.toLowerCase() === selectedValue?.toLowerCase(),
    );

    updateStatusMutation
      .mutateAsync({
        status: found?.value as OnboardingStatus,
        reason_for_rejection:
          selectedValue === OnboardingStatus.REJECTED
            ? fromValue.reason_for_rejection
            : undefined,
        video_interview_on:
          selectedValue === OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_VIDEO
            ? dayjs(fromValue.video_interview_on).format("DD-MM-YYYY HH:mm:ss")
            : undefined,
        f2f_interview_on:
          selectedValue === OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_F2F
            ? dayjs(fromValue.f2f_interview_on).format("DD-MM-YYYY HH:mm:ss")
            : undefined,
      })
      .then((e) => {
        if (e.isSuccess) {
          toast.success(e.message);
          onDismiss();
        } else {
          toast.error(e.message);
        }
      })
      .catch(() => toast.error("Some error ocurred"))
      .finally(refresh);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedValue
              ? STATUSES.find(
                  (status) =>
                    status.value?.toLowerCase() ===
                    selectedValue?.toLowerCase(),
                )?.label
              : "Select status..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, onBlur } }) => (
            <PopoverContent className="z-[100000] w-full p-0">
              <Command className="w-full">
                <CommandInput placeholder="Search status..." />
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {STATUSES.filter((e, i) => {
                    if (
                      _selectedValue &&
                      EXTRA_MAPPINGS_OPTIONS[_selectedValue]
                    ) {
                      const maybe = EXTRA_MAPPINGS_OPTIONS[_selectedValue];
                      if (maybe.includes(e.value)) return true;
                    }
                    const index = STATUS_ORDER.findIndex(
                      (status) => status === _selectedValue,
                    );

                    if (index == i || index + 1 == i) return true;
                    if (ALWAYS_SHOW_STATUS.includes(e.value)) return true;
                    return false;
                  }).map((status) => (
                    <CommandItem
                      key={status.value}
                      value={status.value}
                      onBlur={onBlur}
                      onSelect={(currentValue) => {
                        const found = STATUSES.find(
                          (status) =>
                            status.value?.toLowerCase() ===
                            currentValue?.toLowerCase(),
                        );
                        onChange(found?.value as string);
                        trigger("status");
                        setSelectedValue(currentValue.toUpperCase());
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValue === status.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {status.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          )}
        />
        {errors.status ? (
          <span className="mt-2 text-sm text-red-500">
            {errors.status.message}
          </span>
        ) : null}{" "}
      </Popover>
      {match(selectedValue)
        .with(OnboardingStatus.REJECTED, () => (
        <Input
          disabled={updateStatusMutation.isPending}
          containerClassName="mb-4"
          name="reason_for_rejection"
          label="Reason for rejection"
          placeholder="Reason for rejection"
          error={errors.reason_for_rejection?.message}
          register={register}
        />
        ))
        .with(
          OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_F2F,
          OnboardingStatus.EMPLOYER_INTERVIEWED_F2F,
          OnboardingStatus.EMPLOYER_INTERVIEW_RESCHEDULED_F2F,
          () => (
        <Input
          disabled={updateStatusMutation.isPending}
          containerClassName="mb-4"
          name="f2f_interview_on"
          label="F2F interview on"
          type="datetime-local"
          key={selectedValue}
          error={errors.f2f_interview_on?.message}
          register={register}
        />
          ),
        )
        .with(
          OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_VIDEO,
          OnboardingStatus.EMPLOYER_INTERVIEWED_VIDEO,
          OnboardingStatus.EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO,
          () => (
        <Input
          key={selectedValue}
          disabled={updateStatusMutation.isPending}
          containerClassName="mb-4"
          name="video_interview_on"
          label="Video interview on"
          type="datetime-local"
          error={errors.video_interview_on?.message}
          register={register}
            />
          ),
        )
        .otherwise(() => null)}

      <div className="flex justify-end">
        <Btn
          className="py-2"
          isLoading={updateStatusMutation.isPending}
          type="submit"
          disabled={!selectedValue}
        >
          Update Status
        </Btn>
      </div>
    </form>
  );
}

const fromState = z
  .object({
    status: z.string().min(1),
    reason_for_rejection: z.string().optional(),
    video_interview_on: z.string().optional(),
    f2f_interview_on: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      (values.status === OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_F2F ||
        values.status === OnboardingStatus.EMPLOYER_INTERVIEWED_F2F) &&
      !values.f2f_interview_on
    ) {
      ctx.addIssue({
        message: "Please select a date",
        code: z.ZodIssueCode.custom,
        params: ["f2f_interview_on"],
        path: ["f2f_interview_on"],
      });
    }
    if (
      (values.status === OnboardingStatus.EMPLOYER_INTERVIEW_SCHEDULED_VIDEO ||
        values.status === OnboardingStatus.EMPLOYER_INTERVIEWED_VIDEO) &&
      !values.video_interview_on
    ) {
      ctx.addIssue({
        message: "Please select a date",
        code: z.ZodIssueCode.custom,
        params: ["video_interview_on"],
        path: ["video_interview_on"],
      });
    }
    if (
      values.status === OnboardingStatus.REJECTED &&
      !values.reason_for_rejection
    ) {
      console.log("addissue");
      ctx.addIssue({
        message: "Please give a reason",
        code: z.ZodIssueCode.custom,
        params: ["reason_for_rejection"],
        path: ["reason_for_rejection"],
      });
    }
  });
const STATUSES = Object.entries(OnboardingStatus).map(([key, value]) => ({
  value: value,
  label: formatOnboardingStatus(key),
}));
