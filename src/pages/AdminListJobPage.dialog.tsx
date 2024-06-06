import { axiosApi } from "@/api/api";
import { PopupDialog } from "@/components/PopupDialog";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { convertEnumToStr, emptyArray, makeUrlWithParams } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronRightIcon, User2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const JobRegisterDialog = ({
  selectedJobId,
  closeDialog,
}: {
  selectedJobId: string;
  closeDialog: () => void;
}) => {
  const [hash, setHash] = useLocationHash();
  const { isRecruiter } = useLogin();
  const jobRegisterQuery = useQuery({
    queryKey: ["jobRegister", selectedJobId],
    enabled: !!selectedJobId,
    queryFn: () =>
      axiosApi({
        method: "GET",
        url: makeUrlWithParams("onboarding/job/history/{{jobId}}/", {
          jobId: selectedJobId,
        }),
      }).then((e) => e.data.data.candidates),
  });
  const results = convertCandidatesToAccordion(
    jobRegisterQuery.data || emptyArray,
  );
  return (
    <PopupDialog
      isOpen={!!selectedJobId}
      setIsOpen={() => closeDialog()}
      title="Job Register"
      showXMarkIcon
    >
      <div className="mt-2 min-h-[20vh]">
        {results.length === 0 ? (
          <div className="flex min-h-[20vh] flex-col items-center justify-center gap-y-2">
            {jobRegisterQuery.isPending ? (
              <>
                <SpinnerIcon className="h-6 w-6 animate-spin text-slate-200" />
                <div className="text-center">Loading...</div>
              </>
            ) : (
              <div className="text-center">No data</div>
            )}
          </div>
        ) : null}

        <Accordion
          type="single"
          collapsible
          className="space-y-3 divide-y-0"
          value={hash.replace("#", "")}
          onValueChange={(e) => setHash(`#${e}`)}
        >
          {results.map((result) => (
            <AccordionItem
              key={result.status}
              value={result.status}
              className="border-b-0"
            >
              <AccordionTrigger className="rounded-none border px-4 py-2 hover:no-underline data-[state=open]:rounded-none">
                <div className="space-x-2">
                  <span>{convertEnumToStr(result.status)}</span>
                  <span className="rounded-none border border-black px-2 py-1 text-sm">
                    {result.count}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="m-0 divide-y border border-t-0 p-0">
                {result.candidates.map((candidate) => (
                  <Link
                    to={
                      isRecruiter
                        ? ROUTES.RECRUITER.ONBOARDING.buildPath(
                            {},
                            {
                              id: "" + candidate.onboarding_id,
                            },
                          )
                        : ROUTES.ADMIN.ONBOARDING.buildPath(
                            {},
                            {
                              id: "" + candidate.onboarding_id,
                            },
                          )
                    }
                    key={candidate.onboarding_id}
                    className="flex w-full items-center justify-between p-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full border bg-slate-200 p-2">
                        <User2Icon className="text-black" />
                      </div>
                      <div>{candidate.candidate_name}</div>
                    </div>
                    <div>
                      <ChevronRightIcon className="text-black" />
                    </div>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PopupDialog>
  );
};

const convertCandidatesToAccordion = (
  candidates: {
    onboarding_id: number;
    candidate_name: string;
    datetime: string;
    current_status: string;
  }[] = [],
) => {
  const result: Struct[] = [];
  if (!candidates?.length) return result;
  const statusList = Array.from(
    new Set(candidates.map((e) => e.current_status)),
  );
  statusList.forEach((status) => {
    const filteredCandidates = candidates.filter(
      (e) => e.current_status === status,
    );
    result.push({
      status,
      count: filteredCandidates.length,
      candidates: filteredCandidates,
    });
  });
  return result;
};
interface Struct {
  status: string;
  count: number;
  candidates: {
    onboarding_id: number;
    candidate_name: string;
    datetime: string;
    current_status: string;
  }[];
}

const useLocationHash = () => {
  const [hash, _setHash] = useState(window.location.hash);
  useEffect(() => {
    const handler = () => {
      _setHash(window.location.hash);
    };
    _setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
    };
  }, []);
  const setHash = (hash: string) => {
    if (history.replaceState) {
      history.replaceState(
        null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        null,
        hash,
      );
    } else {
      location.hash = hash;
    }
    _setHash(hash);
  };
  return [hash, setHash] as const;
};
