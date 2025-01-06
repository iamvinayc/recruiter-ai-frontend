import { axiosApi } from "@/api/api";
import { PopupDialog } from "@/components/PopupDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { cn, replaceWith } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useMemo, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { match } from "ts-pattern";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import {
  CandidateScrapper,
  JobScrapper,
  ReScoringDialog,
} from "./ConfigurationListPage.dialog";

export default function ConfigurationListPage() {
  const [showStartScrapperDialog, setShowStartScrapperDialog] = useState(false);
  const [showReScoreDialog, setShowReScoreDialog] = useState(false);
  const { isRecruiter } = useLogin();
  const [{ id: onboardingId }] = useTypedSearchParams(
    isRecruiter ? ROUTES.RECRUITER.ONBOARDING : ROUTES.ADMIN.ONBOARDING,
  );
  const onboardingListingQuery = useInfiniteQuery({
    queryKey: ["onboardingListingQuery", onboardingId],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: replaceWith("scraping/sessions/", pageParam),
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
          id: e.session_id,
          platform: e.platform,
          scrape_type: e.scrape_type,
          status: e.status,
          action: "View",
        })) || [],
    [onboardingListingQuery.data],
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Session Id",
        cell: (info) =>
          `${
            (info.row.original.scrape_type === "CANDIDATE"
              ? "CAND"
              : info.row.original.scrape_type) || ""
          }-${info.getValue()}`,
      }),

      columnHelper.accessor("status", {
        header: "STATUS",
        cell: (info) => (
          <div
            className={clsx(
              "truncate",

              info.getValue() === "IN_PROGRESS"
                ? "text-yellow-500"
                : "text-green-500",
            )}
            title={info.getValue()}
          >
            {info
              .getValue()
              .replace("_", " ")
              .toLowerCase()
              .split("")
              .map((e, i) => (i === 0 ? e.toUpperCase() : e))}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("platform", {
        header: "PLATFORM",
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info
              .getValue()
              .toLowerCase()
              .split("")
              .map((e, i) => (i === 0 ? e.toUpperCase() : e))}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("action", {
        header: () => <div>Action</div>,
        cell: (info) => (
          <div
            className="flex justify-between text-blue-500 underline "
            title={info.getValue()}
          >
            <Link
              to={match(info.row.original.scrape_type)
                .with("JOB", () =>
                  (isRecruiter
                    ? ROUTES.RECRUITER.LIST_JOBS
                    : ROUTES.ADMIN.LIST_JOBS
                  ).buildPath(
                    {},
                    { scraping_session_id: info.row.original.id.toString() },
                  ),
                )
                .with("CANDIDATE", () =>
                  (isRecruiter
                    ? ROUTES.RECRUITER.LIST_CANDIDATE
                    : ROUTES.ADMIN.LIST_CANDIDATE
                  ).buildPath(
                    {},
                    { scraping_session_id: info.row.original.id.toString() },
                  ),
                )
                .otherwise(() => "")}
            >
              <span>
                View{" "}
                {info.row.original?.scrape_type
                  ?.toLowerCase()
                  .split("")
                  .map((e, i) => (i === 0 ? e.toUpperCase() : e))}
              </span>
            </Link>
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

  return (
    <main>
      <div className="mx-auto w-full p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Scrapping Sessions
          </h2>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowReScoreDialog(true);
              }}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Re-Score
            </Button>
            <Button
              onClick={() => {
                setShowStartScrapperDialog(true);
              }}
              className="text-white"
            >
              Start New Scrapper
            </Button>
          </div>
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
        <PopupDialog
          isOpen={showStartScrapperDialog}
          setIsOpen={setShowStartScrapperDialog}
          title="New Scrapper"
          showXMarkIcon
        >
          <Tabs defaultValue="candidate" className="mt-4">
            <TabsList>
              <TabsTrigger value="candidate">Candidate</TabsTrigger>
              <TabsTrigger value="job">Job</TabsTrigger>
            </TabsList>
            <TabsContent
              value="candidate"
              className=" max-h-[70vh] overflow-y-auto"
            >
              <CandidateScrapper
                onClose={() => {
                  setShowStartScrapperDialog(false);
                  onboardingListingQuery.refetch();
                }}
              />
            </TabsContent>
            <TabsContent value="job" className=" max-h-[70vh] overflow-y-auto">
              <JobScrapper
                onClose={() => {
                  setShowStartScrapperDialog(false);
                  onboardingListingQuery.refetch();
                }}
              />
            </TabsContent>
          </Tabs>
        </PopupDialog>
        <PopupDialog
          isOpen={showReScoreDialog}
          setIsOpen={setShowReScoreDialog}
          title="Re-Score"
          showXMarkIcon
        >
          <ReScoringDialog
            onClose={() => {
              setShowReScoreDialog(false);
              onboardingListingQuery.refetch();
            }}
          />
        </PopupDialog>
      </div>
    </main>
  );
}

interface OnboardingList {
  id: string;
  platform: string;
  scrape_type: "JOB" | "CANDIDATE";
  status: "IN_PROGRESS" | "COMPLETED";
  action: string;
}
const columnHelper = createColumnHelper<OnboardingList>();
