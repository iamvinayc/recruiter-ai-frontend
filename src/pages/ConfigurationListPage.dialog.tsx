import { axiosApi } from "@/api/api";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { LocationSelector } from "@/components/LocationSelector";
import { MultiSelect } from "@/components/multi-select";
import { MultipleSkillSelectorItems } from "@/components/MultipleSkillSelecter";
import { SectorSelector } from "@/components/SectorSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { replaceWith } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { DivLoader } from "./common/TableLoader";

//#region Job Scrapper
export const JobScrapper = ({ onClose }: { onClose: () => void }) => {
  const { control, handleSubmit, reset } = useForm<
    z.infer<typeof jobFormSchema>
  >({
    resolver: zodResolver(jobFormSchema),
    defaultValues: defaultJobFormValues,
  });

  const startJobScrapperMutation = useMutation({
    mutationKey: ["startJobScrapperMutation"],
    mutationFn: async (data: z.infer<typeof jobFormSchema>) => {
      return axiosApi({
        url: "scraping/start/",
        method: "POST",
        params: {
          scraping_type: "job",
        },
        data: {
          platform: data.platform,
          total_jobs: data.noOfJobs,
          sector: data.sector,
          job_title: data.designation,
          location: data.location,
          skills: data.skill.map((e) => e.id),
        },
      }).then((e) => e.data);
    },
  });

  const onSubmit = async (data: z.infer<typeof jobFormSchema>) => {
    try {
      const { message, isSuccess } =
        await startJobScrapperMutation.mutateAsync(data);
      if (isSuccess) {
        toast.success(message);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (e) {
      console.log("err", e);
      toast.error("Something went wrong");
    }
  };
  useEffect(() => {
    return () => reset(defaultJobFormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <Controller
        control={control}
        name="designation"
        render={({ fieldState, field: { value, onChange } }) => (
          <Input
            value={value}
            onInput={(e) => onChange(e.currentTarget.value)}
            placeholder="Designation"
            label="Designation"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="platform"
        render={({ fieldState, field: { value, onChange } }) => (
          <Input
            value={value}
            onInput={(e) => onChange(e.currentTarget.value)}
            placeholder="Platform"
            label="Platform"
            error={fieldState.error?.message}
          />
        )}
      />

      {/* designation */}
      <Controller
        control={control}
        name="location"
        render={({ fieldState, field: { value, onChange } }) => (
          <LocationSelector
            selected={{ name: value }}
            setSelected={(e) => onChange(e.name)}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="sector"
        render={({ fieldState, field: { value, onChange } }) => (
          <SectorSelector
            selectedItem={value}
            setSelectedItem={onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="skill"
        render={({ fieldState, field: { value, onChange } }) => (
          <MultipleSkillSelectorItems
            selectedItems={value}
            setSelectedItems={onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="noOfJobs"
        render={({ fieldState, field: { value, onChange } }) => (
          <Input
            placeholder="No of jobs"
            type="number"
            label="No of jobs"
            min={1}
            max={10}
            value={value}
            onInput={(e) => {
              onChange(+e.currentTarget.value);
            }}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="flex w-full items-center justify-center">
        <Button
          isLoading={startJobScrapperMutation.isPending}
          className="rounded-none border-yellow-600 bg-yellow-500 py-2 text-white"
        >
          Scrape Jobs
        </Button>
      </div>
    </form>
  );
};

const jobFormSchema = z.object({
  designation: z.string().min(1, "Designation is required"),
  platform: z.string().min(1, "Platform is required"),
  location: z.string().min(1, "Location is required"),
  sector: z.string().min(1, "Sector is required"),
  skill: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .min(1, "Skill is required"),
  noOfJobs: z
    .number()
    .min(1, "No of jobs should be at-least 1")
    .max(10, "No of jobs should be at-most 10"),
});
const defaultJobFormValues: z.infer<typeof jobFormSchema> = {
  designation: "",
  location: "",
  noOfJobs: 3,
  platform: "LINKEDIN",
  sector: "",
  skill: [],
};
//#endregion

//#region candidate scrapper
export const CandidateScrapper = ({ onClose }: { onClose: () => void }) => {
  const candidateFrom = useForm<z.infer<typeof candidateFormSchema>>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: defaultCandidateFormValues,
  });
  const jobSearchFrom = useForm<z.infer<typeof candidateJobSchema>>({
    resolver: zodResolver(candidateJobSchema),
    defaultValues: defaultCandidateJobValues,
  });

  const [currentSearchParams, setCurrentSearchParams] = useState<
    Partial<z.infer<typeof candidateJobSchema>>
  >({});
  const [selectedJobs, setSelectedJobs] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const isJobFilterApplied = Object.keys(currentSearchParams).length > 0;
  const jobResult = useInfiniteQuery({
    queryKey: ["job-search-candidate-search", currentSearchParams],
    queryFn: async ({ pageParam }) => {
      const department =
        currentSearchParams.skill?.map((e) => e.id).join(",") || "";
      return axiosApi({
        method: "GET",
        url: replaceWith("data-sourcing/job/", pageParam),
        params: {
          location: currentSearchParams.location,
          department: department ? `[${department}]` : undefined,
          from_date: currentSearchParams.startDate,
          to_date: currentSearchParams.endDate,
          //   sector: currentSearchParams.sector,
          page_size: 20,
        },
      }).then((e) => e.data);
    },
    getNextPageParam(e) {
      return e.next?.includes("page_size")
        ? e.next
        : e.next
        ? e.next + "&page_size=20"
        : e.next;
    },
    initialPageParam: "",
  });
  const startCandidateScrapperMutation = useMutation({
    mutationKey: ["startCandidateScrapperMutation", selectedJobs],
    mutationFn: async (data: z.infer<typeof candidateFormSchema>) => {
      return axiosApi({
        url: "scraping/start/",
        method: "POST",
        params: {
          scraping_type: "candidate",
        },
        data: {
          platform: data.platform,
          total_candidates: data.noOfCandidates,
          sector: data.sector,
          job_ids: selectedJobs.map((e) => +e.id),
        },
      }).then((e) => e.data);
    },
  });

  const onSubmit = async (data: z.infer<typeof candidateFormSchema>) => {
    try {
      const { message, isSuccess } =
        await startCandidateScrapperMutation.mutateAsync(data);
      if (isSuccess) {
        toast.success(message);
        onClose();
      } else {
        toast.error(message);
      }
    } catch (e) {
      console.log("err", e);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    return () => candidateFrom.reset(defaultCandidateFormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const jobList = jobResult.data?.pages?.map((e) => e.data).flat() || [];
  const isUpdateLoading = jobResult.isLoading || jobResult.isRefetching;
  const selectedScrapeForm = jobSearchFrom.watch("startDate");
  const selectedScrapeTo = jobSearchFrom.watch("endDate");

  return (
    <div className="flex gap-4">
      <div className="flex-1 gap-4 ">
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold">Job Filter</div>
          {isJobFilterApplied && (
            <button
              onClick={() => {
                setCurrentSearchParams({});
                jobSearchFrom.reset(defaultCandidateJobValues);
              }}
              className="text-xs text-blue-400 underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <form
          onSubmit={jobSearchFrom.handleSubmit(() => 0)}
          className="flex flex-col gap-4"
        >
          <Controller
            control={jobSearchFrom.control}
            name="location"
            render={({ fieldState, field: { value, onChange } }) => (
              <LocationSelector
                selected={{ name: value }}
                setSelected={(e) => onChange(e.name)}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={jobSearchFrom.control}
            name="skill"
            render={({ fieldState, field: { value, onChange } }) => (
              <MultipleSkillSelectorItems
                selectedItems={value}
                setSelectedItems={onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <DatePickerWithRange
            title="Scraped Date Range"
            selectedFromDate={selectedScrapeForm}
            selectedToDate={selectedScrapeTo}
            setSelectedFromDate={(dt) => {
              jobSearchFrom.setValue("startDate", dt);
            }}
            setSelectedToDate={(dt) => {
              jobSearchFrom.setValue("endDate", dt);
            }}
          />
          <div className="flex w-full items-center justify-center">
            <Button
              onClick={() => {
                setCurrentSearchParams(jobSearchFrom.getValues());
              }}
              className="rounded-none border-yellow-600 bg-yellow-500 py-2 text-white disabled:border-slate-800 disabled:bg-slate-600"
            >
              Filter Jobs
            </Button>
          </div>
        </form>
        <form
          className="flex flex-col gap-4"
          onSubmit={candidateFrom.handleSubmit(onSubmit)}
        >
          <Controller
            control={candidateFrom.control}
            name="platform"
            render={({ fieldState, field: { value, onChange } }) => (
              <Input
                value={value}
                onInput={(e) => onChange(e.currentTarget.value)}
                placeholder="Platform"
                label="Platform"
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={candidateFrom.control}
            name="sector"
            render={({ fieldState, field: { value, onChange } }) => (
              <SectorSelector
                selectedItem={value}
                setSelectedItem={onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={candidateFrom.control}
            name="noOfCandidates"
            render={({ fieldState, field: { value, onChange } }) => (
              <Input
                placeholder="No of candidates"
                type="number"
                label="No of candidates"
                min={1}
                max={10}
                value={value}
                onInput={(e) => {
                  onChange(+e.currentTarget.value);
                }}
                error={fieldState.error?.message}
              />
            )}
          />
          <div className="flex items-center justify-center">
            <Button
              disabled={
                Object.values(candidateFrom.formState.errors).filter(Boolean)
                  .length > 0 || selectedJobs.length === 0
              }
              isLoading={startCandidateScrapperMutation.isPending}
              className="rounded-none border-yellow-600 bg-yellow-500 py-2 text-white disabled:border-slate-600 disabled:bg-slate-500"
            >
              Scrape Candidates
            </Button>
          </div>
        </form>
      </div>
      <div className=" flex-1">
        <div className="flex flex-col gap-4">
          <div>Jobs ({selectedJobs.length}/10)</div>
          <div
            className="relative h-[60vh] overflow-y-scroll border"
            id="scrollLayout"
          >
            <InfinityLoaderComponent
              dataLength={jobList.length || 0}
              hasMore={jobResult.hasNextPage}
              next={() => {
                jobResult.fetchNextPage();
              }}
              scrollableTarget="scrollLayout"
              loader={
                jobResult.hasNextPage ? (
                  <div className="mb-4 flex items-center justify-center">
                    <Button
                      isLoading={jobResult.isFetchingNextPage}
                      className="py-2"
                      onClick={() => jobResult.fetchNextPage()}
                    >
                      Load More
                    </Button>
                  </div>
                ) : null
              }
            >
              <div>
                {jobList?.map((item) => (
                  <div className=" p-4" key={item.id}>
                    <div className="items-top flex space-x-2">
                      <Checkbox
                        id={`id-${item.id}`}
                        checked={selectedJobs.some(
                          (e) => e.id.toString() === item.id.toString(),
                        )}
                        onCheckedChange={(checked) => {
                          if (checked && selectedJobs.length >= 10) {
                            return toast.error(
                              "You can select at most 10 jobs",
                            );
                          }

                          if (checked) {
                            setSelectedJobs((prev) => [
                              ...prev,
                              { id: item.id.toString(), name: item.title },
                            ]);
                          } else {
                            console.log("checked", checked);
                            setSelectedJobs((prev) =>
                              prev.filter(
                                (e) => e.id.toString() !== item.id.toString(),
                              ),
                            );
                          }
                        }}
                      />
                      <div className="grid cursor-pointer gap-1.5 leading-none">
                        <label
                          htmlFor={`id-${item.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item.title}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <DivLoader
                  dataList={jobList}
                  isLoading={jobResult.isLoading}
                  isUpdateLoading={isUpdateLoading}
                />
              </div>
            </InfinityLoaderComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

const candidateJobSchema = z.object({
  location: z.string().default(""),
  skill: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )

    .default([]),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
});

const defaultCandidateJobValues: z.infer<typeof candidateJobSchema> = {
  location: "",
  skill: [],
  startDate: "",
  endDate: "",
};

const candidateFormSchema = z.object({
  sector: z.string().min(1, "Sector is required"),
  platform: z.string().min(1, "Platform is required"),
  noOfCandidates: z
    .number()
    .min(1, "No of candidates should be at-least 1")
    .max(10, "No of candidates should be at-most 10"),
  //   jobs: z
  //     .array(
  //       z.object({
  //         id: z.string(),
  //         name: z.string(),
  //       }),
  //     )
  //     .min(1, "At least one job is required"),
});
const defaultCandidateFormValues: z.infer<typeof candidateFormSchema> = {
  noOfCandidates: 3,
  platform: "LINKEDIN",
  sector: "",
  //   jobs: [],
};
//#endregion

//#region Job Re-Scoring
export const JobReScoringDialog = ({ onClose }: { onClose: () => void }) => {
  const [selectedItems, setSelectedItems] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [selectedScrapeForm, setSelectedScrapeForm] = useState("");
  const [selectedScrapeTo, setSelectedScrapeTo] = useState("");
  const [searchText, setSearchText] = useState("");

  const jobListQuery = useQuery({
    queryKey: ["job-list-rescore", searchText],
    queryFn: async () => {
      return axiosApi({
        url: "data-sourcing/job/",
        method: "GET",
        params: {
          search: searchText,
        },
      }).then((e) => e.data.data || []);
    },
  });
  const startScrapeMutation = useMutation({
    mutationKey: ["startScrapeMutation-job-rescore"],
    mutationFn: ({
      selectedItems,
      selectedScrapeForm,
      selectedScrapeTo,
    }: {
      selectedScrapeForm: string;
      selectedScrapeTo: string;
      selectedItems: { value: string; label: string }[];
    }) => {
      return axiosApi({
        method: "POST",
        url: replaceWith("onboarding/scoring", "onboarding/scoring/"),
        data: {
          from_date: selectedScrapeForm,
          to_date: selectedScrapeTo,
          job_ids: selectedItems.map((e) => +e.value),
        },
      }).then((e) => e.data);
    },
  });
  const jobList =
    jobListQuery.data?.map((e) => ({
      value: e.id.toString(),
      label: e.title,
    })) || [];

  const onSubmit = async () => {
    try {
      const { isSuccess, message } = await startScrapeMutation.mutateAsync({
        selectedItems,
        selectedScrapeForm,
        selectedScrapeTo,
      });
      if (isSuccess) {
        toast.success("Re-scoring started");
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DatePickerWithRange
        title="Scraped Date Range"
        selectedFromDate={selectedScrapeForm}
        selectedToDate={selectedScrapeTo}
        setSelectedFromDate={setSelectedScrapeForm}
        setSelectedToDate={setSelectedScrapeTo}
      />
      <div className="">
        <h1 className="text-md mb-4 font-bold">Jobs</h1>
        <MultiSelect
          isPending={jobListQuery.isPending}
          options={jobList}
          onValueChange={setSelectedItems}
          setSelectedValues={setSelectedItems}
          selectedValues={selectedItems}
          placeholder="Search Jobs"
          variant="inverted"
          maxCount={10}
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />
      </div>
      <div className="flex justify-end" onClick={onSubmit}>
        <Button isLoading={startScrapeMutation.isPending} className="py-2">
          Re-Score
        </Button>
      </div>
    </div>
  );
};
//#endregion

//#region Candidate Re-Scoring
export const CandidateReScoringDialog = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [selectedItems, setSelectedItems] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [selectedScrapeForm, setSelectedScrapeForm] = useState("");
  const [selectedScrapeTo, setSelectedScrapeTo] = useState("");
  const [searchText, setSearchText] = useState("");

  const candidateListQuery = useQuery({
    queryKey: ["candidate-list-rescore", searchText],
    queryFn: async () => {
      return axiosApi({
        url: "data-sourcing/candidate/",
        method: "GET",
        params: {
          search: searchText,
        },
      }).then((e) => e.data.data || []);
    },
  });
  const startScrapeMutation = useMutation({
    mutationKey: ["startScrapeMutation-candidate-rescore"],
    mutationFn: ({
      selectedItems,
      selectedScrapeForm,
      selectedScrapeTo,
    }: {
      selectedScrapeForm: string;
      selectedScrapeTo: string;
      selectedItems: { value: string; label: string }[];
    }) => {
      return axiosApi({
        method: "POST",
        url: replaceWith("onboarding/scoring", "onboarding/scoring/"),
        data: {
          from_date: selectedScrapeForm,
          to_date: selectedScrapeTo,
          candidate_ids: selectedItems.map((e) => +e.value),
        },
      }).then((e) => e.data);
    },
  });
  const candidateList =
    candidateListQuery.data?.map((e) => ({
      value: e.id.toString(),
      label: e.name,
    })) || [];

  const onSubmit = async () => {
    try {
      const { isSuccess, message } = await startScrapeMutation.mutateAsync({
        selectedItems,
        selectedScrapeForm,
        selectedScrapeTo,
      });
      if (isSuccess) {
        toast.success("Re-scoring started");
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DatePickerWithRange
        title="Scraped Date Range"
        selectedFromDate={selectedScrapeForm}
        selectedToDate={selectedScrapeTo}
        setSelectedFromDate={setSelectedScrapeForm}
        setSelectedToDate={setSelectedScrapeTo}
      />
      <div className="">
        <h1 className="text-md mb-4 font-bold">Candidate</h1>
        <MultiSelect
          isPending={candidateListQuery.isPending}
          options={candidateList}
          onValueChange={setSelectedItems}
          setSelectedValues={setSelectedItems}
          selectedValues={selectedItems}
          placeholder="Search Candidate"
          variant="inverted"
          maxCount={10}
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />
      </div>
      <div className="flex justify-end" onClick={onSubmit}>
        <Button isLoading={startScrapeMutation.isPending} className="py-2">
          Re-Score
        </Button>
      </div>
    </div>
  );
};
//#endregion
