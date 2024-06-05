import { axiosApi, formatOnboardingStatus, OnboardingStatusMap } from "@/api/api";
import { PopupDialog } from "@/components/PopupDialog";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { User2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { emptyArray, makeUrlWithParams } from "@/utils";
import dayjs from "dayjs";
import { match } from "ts-pattern";
import { BellIcon, Check, MessageSquareMoreIcon } from "lucide-react";
import { ReadMore } from "@/components/common/ReadMore";


const EmployerListDialog = ({
    selectedEmployerId,
    closeDialog,
}: {
    selectedEmployerId: string;
    closeDialog: () => void;
}) => {
    const [hash, setHash] = useLocationHash();

    const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
    const [notificationId, setNotificationId] = useState("");

    const setShowNotificationPopup = (isOpen: boolean) => {
        setIsNotificationPopupOpen(isOpen);
    };

    const handleCloseDialog = () => {
        if (!isNotificationPopupOpen) {
            closeDialog();
        }
    };

    const openNotificationPopup = (notification_id: string) => {
        setNotificationId(notification_id);
        setShowNotificationPopup(true);
    };

    const employerHistoryQuery = useQuery({
        queryKey: ["employerHistory", selectedEmployerId],
        enabled: !!selectedEmployerId,
        queryFn: () =>
            axiosApi({
                method: "GET",
                url: makeUrlWithParams("data-sourcing/employer/history/{{employerId}}/", {
                    employerId: selectedEmployerId,
                }),
            }).then((e) => e.data.data),
    });

    const results = employerHistoryQuery.data || emptyArray;

    const notificationDetailsQuery = useQuery({
        queryKey: ["notificationDetails", notificationId],
        queryFn: async () =>
            axiosApi({
                url: makeUrlWithParams("notification/{{notificationId}}/", {
                    notificationId: notificationId,
                }),
                method: "GET",
            }).then((e) => e.data),
        enabled: !!notificationId,
    });
    const content = notificationDetailsQuery?.data?.data?.content || "";

    return (
        <div>
            <PopupDialog
                isOpen={!!selectedEmployerId}
                setIsOpen={handleCloseDialog}
                title="Company History"
                showXMarkIcon
            >
                <div className="mt-2 min-h-[20vh] max-h-[80vh] overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-y-2">
                            {employerHistoryQuery.isPending ? (
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
                        {results.map((job) => (
                            <AccordionItem
                                key={job.job_id}
                                value={job.job_id.toString()}
                                className="border-b-0"
                            >
                                <AccordionTrigger className="rounded-lg border px-4 py-2 hover:no-underline data-[state=open]:rounded-b-none">
                                    <div className="space-x-2">
                                        <span>{job.job_title}</span>
                                        <span className="rounded-lg border border-black px-2 py-1 text-sm">
                                            {job.candidates.length}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="m-0 divide-y border border-t-0 p-0">
                                    {job.candidates.map((candidate) => (
                                        <Accordion
                                            type="single"
                                            collapsible
                                            key={`${job.job_id}-${candidate.candidate_id}`}
                                            className="space-y-3 divide-y-0"
                                        >
                                            <AccordionItem
                                                value={`${job.job_id}-${candidate.candidate_id}`}
                                                className="border-b-0"
                                            >
                                                <AccordionTrigger className="flex items-center justify-between rounded-lg border px-4 py-2 hover:no-underline data-[state=open]:rounded-b-none">
                                                    <div className="flex items-center gap-4">
                                                        <div className="rounded-full border bg-slate-200 p-2">
                                                            <User2Icon className="text-black" />
                                                        </div>
                                                        <div>{candidate.candidate_name}</div>
                                                    </div>
                                                </AccordionTrigger>
                                                {candidate.data.length > 0 ? (
                                                    <AccordionContent className="m-0 divide-y border border-t-0 p-0">
                                                        {candidate.data.map((detail, i) => (
                                                            <div key={i + "candidate"} className="rounded-md border p-2 shadow-sm">
                                                                <div className="flex items-center justify-between my-2 mx-1">
                                                                    {match(detail.type)
                                                                        .with("comment", () => (
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className="rounded-full bg-primary p-2">
                                                                                    <MessageSquareMoreIcon className="h-4 w-4 text-white" />
                                                                                </div>
                                                                                <div className="text-base">Comment</div>
                                                                            </div>
                                                                        ))
                                                                        .with("status_change", () => (
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className="rounded-full bg-green-600 p-2">
                                                                                    <Check className="h-4 w-4 text-white" />
                                                                                </div>
                                                                                <div className="text-base">Status Change</div>
                                                                            </div>
                                                                        ))
                                                                        .with("notification", () => (
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className="rounded-full bg-yellow-500 p-2">
                                                                                    <BellIcon className="h-4 w-4 text-white" />
                                                                                </div>
                                                                                <div className="text-base">Notification</div>
                                                                            </div>
                                                                        ))
                                                                        .exhaustive()}
                                                                    <div className="text-sm font-medium">
                                                                        {detail.datetime
                                                                            ? dayjs(detail.datetime).format("DD MMM YYYY hh:mm A")
                                                                            : ""}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2">
                                                                    {match(detail.type)
                                                                        .with("status_change", () => convertStatusTitle(detail.title))
                                                                        .with("comment", () => <ReadMore text={detail.title} />)
                                                                        .otherwise(() => detail.title)}
                                                                </div>
                                                                {match(detail.status)
                                                                    .with("Recruiter Followup", () => (
                                                                        <div className="mt-2">
                                                                            <div className="flex flex-wrap items-center gap-x-2">
                                                                                <div className="font-semibold">Follow Up On:</div>
                                                                                <div>
                                                                                    {detail.related_date
                                                                                        ? dayjs(detail.related_date).format("DD MMM YYYY hh:mm A")
                                                                                        : ""}
                                                                                </div>
                                                                            </div>
                                                                            <ReadMore
                                                                                prefix={<span className="font-semibold">Follow up Reason: </span>}
                                                                                text={detail.related_message}
                                                                            />
                                                                        </div>
                                                                    ))
                                                                    .with(
                                                                        "EMPLOYER_INTERVIEWED_F2F",
                                                                        "EMPLOYER_INTERVIEW_RESCHEDULED_F2F",
                                                                        "EMPLOYER_INTERVIEW_SCHEDULED_F2F",
                                                                        "EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO",
                                                                        "EMPLOYER_INTERVIEW_SCHEDULED_VIDEO",
                                                                        "EMPLOYER_INTERVIEWED_VIDEO",
                                                                        (status) => (
                                                                            <div className="mt-2 flex flex-wrap items-center gap-x-2">
                                                                                <div className="font-semibold">
                                                                                    {formatOnboardingStatus(status)} on:
                                                                                </div>
                                                                                <div>
                                                                                    {detail.related_date
                                                                                        ? dayjs(detail.related_date).format("DD MMM YYYY hh:mm A")
                                                                                        : ""}
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                    )
                                                                    .with(
                                                                        "FEEDBACK_SUBMITTED_BY_CANDIDATE",
                                                                        "FEEDBACK_SUBMITTED_BY_EMPLOYER",
                                                                        () => (
                                                                            <div className="mt-2">
                                                                                <div className="font-semibold">Feedback Message:</div>
                                                                                <ReadMore text={detail.related_message} />
                                                                            </div>
                                                                        ),
                                                                    )
                                                                    .otherwise(() =>
                                                                        detail.related_message ? (
                                                                            <div className="mt-2">
                                                                                <div className="font-semibold">Message:</div>
                                                                                <ReadMore text={detail.related_message} />
                                                                            </div>
                                                                        ) : null,
                                                                    )}
                                                                <div className="flex justify-end">
                                                                    {detail.type === "notification" ? (
                                                                        <button
                                                                            onClick={() => {
                                                                                const notification_id = detail.notification_id;
                                                                                if (notification_id) {
                                                                                    openNotificationPopup(notification_id.toString());
                                                                                }
                                                                            }}
                                                                            className="mt-2 text-sm text-blue-700"
                                                                        >
                                                                            View Details
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </AccordionContent>
                                                ) : (
                                                    <AccordionContent className="m-0 border border-t-0 p-4 text-gray-500 text-center">
                                                        No data available
                                                    </AccordionContent>
                                                )}
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </PopupDialog>
            <PopupDialog
                isOpen={isNotificationPopupOpen}
                setIsOpen={() => setShowNotificationPopup(false)}
                title="Notification Details"
                containerClassName="relative h-[70vh]"
                showXMarkIcon
            >
                {content ? (
                    <iframe
                        src={`data:text/html;base64,${btoa(
                            unescape(encodeURIComponent(content)),
                        )}`}
                        className="h-full w-full py-4"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center gap-4">
                        <SpinnerIcon className="h-6 w-6 text-slate-400" />
                    </div>
                )}
            </PopupDialog>
        </div>
    );
};

const convertStatusTitle = (text: string) => {
    let finalString = text.replace("None - ", "");
    Object.entries(OnboardingStatusMap).forEach(([key, value]) => {
        finalString = finalString.replace(key, value);
    });
    return finalString.replace(" - ", " → ");
};

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

export default EmployerListDialog;
