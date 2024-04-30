import React from "react";

import { axiosApi } from "@/api/api";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import {
  FloatingArrow,
  FloatingFocusManager,
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { match } from "ts-pattern";
import { SpinnerIcon } from "./common/SvgIcons";

export interface EventItem {
  id: number;
  pending_action: string;
  job_title: string;
  candidate_name: string;
  interview_date: string;
  title: string;
}
const date_format = "DD-MM-YYYY";
export function EventCalendar() {
  const { isRecruiter } = useLogin();
  const [isOpen, setIsOpen] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarType, setCalendarType] = useState<"day" | "week" | "month">(
    "month",
  );
  const eventsDataQuery = useQuery({
    queryKey: ["events_data", calendarType, selectedDate.format(date_format)],
    queryFn: async () => {
      const { from_date, to_date } = match(calendarType)
        .with("day", () => ({
          from_date: selectedDate.startOf("day").format(date_format),
          to_date: selectedDate.endOf("day").format(date_format),
        }))
        .with("week", () => ({
          from_date: selectedDate.startOf("week").format(date_format),
          to_date: selectedDate.endOf("week").format(date_format),
        }))
        .with("month", () => {
          const dates = getCalendarByDate(selectedDate);
          const [from_date, to_date] = [dates[0], dates[dates.length - 1]];
          return {
            from_date: from_date.format(date_format),
            to_date: to_date.format(date_format),
          };
        })
        .exhaustive();

      return axiosApi({
        url: "dashboard/calender_events/",
        method: "GET",
        params: {
          from_date,
          to_date,
        },
      }).then((e) => e.data.data);
    },
    select(data) {
      return data.map<EventItem>((e) => ({
        candidate_name: e.candidate.name,
        interview_date: [
          e.action?.interview?.date,
          e.action?.interview?.time,
        ].join(" "),
        job_title: e.job.title,
        pending_action: e.type,
        id: e.action.interview.onboarding_id,
        title: e.type,
      }));
    },
  });
  const events_data = eventsDataQuery.data ?? [];
  const isLoading = eventsDataQuery.isPending;
  //#region useFloating
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: !!isOpen,
    onOpenChange: (open) => setIsOpen(open ? null : null),
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: "end" }),
      shift(),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const headingId = useId();
  //#endregion
  const hours = useMemo(() => new Array(24).fill(0).map((_, i) => i), []);

  const weekDays = useMemo(
    () => getCalendarByWeek(selectedDate),
    [selectedDate],
  );
  const monthDays = useMemo(
    () => getCalendarByDate(selectedDate).map((e) => e),
    [selectedDate],
  );
  console.log("monthDays", monthDays);

  const selectedEvent = events_data.find((e) => e.id === isOpen);

  const RenderEvent = useCallback(
    ({ date, event }: { event: EventItem; date: dayjs.Dayjs }) => {
      return (
        <div
          key={event.id}
          onClick={() => {
            console.log("Clicked");
            setIsOpen(event.id);
          }}
          className={[
            `text-balance relative w-full cursor-pointer overflow-hidden  break-words rounded-lg bg-blue-500 px-1 py-0.5 font-sans text-xs text-white`,
            isOpen === event.id ? "" : "",
          ].join(" ")}
          {...(isOpen === event.id
            ? {
                ref: refs.setReference,
                ...getReferenceProps(),
                ["data-test"]: date.format("YYYY-MM-DD HH:mm"),
              }
            : {})}
        >
          {event.title}
        </div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen],
  );

  return (
    <div
      className={cn(
        "relative box-border max-h-[660px]  border",
        isLoading ? "overflow-hidden" : "overflow-y-scroll",
      )}
    >
      <CalendarHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        header={
          <WeekHeader selectedDate={selectedDate} calendarType={calendarType} />
        }
        calendarType={calendarType}
        setCalendarType={setCalendarType}
      />
      {match(calendarType)
        .with("month", () => (
          <div className=" relative grid  grid-cols-7 divide-x divide-y  border-b">
            {monthDays.map((monthDay) => (
              <div
                className={clsx(
                  "min-h-[7em] space-y-1 p-1 text-left text-sm",
                  !selectedDate.isSame(monthDay, "month") &&
                    "bg-slate-100 text-slate-500",
                )}
                key={monthDay.format("YYYY-MM-DD")}
              >
                <div
                  className={clsx(
                    "inline-block",
                    monthDay.isSame(dayjs(), "day") &&
                      "flex h-8 w-8 items-center justify-center rounded-full border bg-primary p-2 text-white",
                  )}
                >
                  {monthDay.format("DD")}
                </div>

                {events_data
                  .filter((event) =>
                    dayjs(`${event.interview_date}`).isSame(monthDay, "day"),
                  )
                  .map((event) => (
                    <RenderEvent date={monthDay} event={event} key={event.id} />
                  ))}
              </div>
            ))}
            {isLoading && (
              <div className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-slate-700 bg-opacity-40">
                <SpinnerIcon className="mt-4 h-6 w-6 " />
              </div>
            )}
          </div>
        ))
        .with("week", () => (
          <div className="relative grid  grid-cols-8 divide-x border-b">
            <div className="space-y-1 divide-y">
              {hours.map((h) => (
                <div
                  className="flex h-[4em] items-center justify-center p-1"
                  key={h}
                >
                  {h}:00
                </div>
              ))}
            </div>
            {weekDays.map((weekDay, i) => (
              <div className="space-y-1 divide-y" key={i}>
                {hours
                  .map((h) =>
                    weekDay.set("hour", h).set("minute", 0).set("second", 0),
                  )
                  .map((hourWeekDay, i) => (
                    <div className="h-[4em] space-y-1 p-1" key={i}>
                      {events_data
                        .filter(
                          (event) =>
                            dayjs(`${event.interview_date}`).isSame(
                              hourWeekDay,
                              "hour",
                            ) &&
                            dayjs(`${event.interview_date}`).isSame(
                              hourWeekDay,
                              "day",
                            ),
                        )
                        .map((event) => (
                          <RenderEvent
                            date={hourWeekDay}
                            event={event}
                            key={event.id}
                          />
                        ))}
                    </div>
                  ))}
              </div>
            ))}
            {isLoading && (
              <div className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-slate-700 bg-opacity-40">
                <SpinnerIcon className="mt-4 h-6 w-6 " />
              </div>
            )}
          </div>
        ))
        .with("day", () => (
          <div className="relative grid  grid-cols-8 divide-x border-b">
            <div className="space-y-1 divide-y">
              {hours.map((h) => (
                <div
                  className="flex h-[4em] items-center justify-center p-1"
                  key={h}
                >
                  {h}:00
                </div>
              ))}
            </div>
            {[selectedDate].map((weekDay, i) => (
              <div className="col-span-7 space-y-1 divide-y" key={i}>
                {hours
                  .map((h) =>
                    weekDay.set("hour", h).set("minute", 0).set("second", 0),
                  )
                  .map((hourWeekDay, i) => (
                    <div className="h-[4em] space-y-1 p-1" key={i}>
                      {events_data
                        .filter(
                          (event) =>
                            dayjs(`${event.interview_date}`).isSame(
                              hourWeekDay,
                              "hour",
                            ) &&
                            dayjs(`${event.interview_date}`).isSame(
                              hourWeekDay,
                              "day",
                            ),
                        )
                        .map((event) => (
                          <RenderEvent
                            date={hourWeekDay}
                            event={event}
                            key={event.id}
                          />
                        ))}
                    </div>
                  ))}
              </div>
            ))}
            {isLoading && (
              <div className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-slate-700 bg-opacity-40">
                <SpinnerIcon className="mt-4 h-6 w-6 " />
              </div>
            )}
          </div>
        ))
        .exhaustive()}
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            className="Popover z-30 max-w-[200px]"
            ref={refs.setFloating}
            style={floatingStyles}
            aria-labelledby={headingId}
            {...getFloatingProps()}
          >
            <FloatingArrow ref={arrowRef} context={context} fill="#ddd" />

            <h2 id={headingId}>
              <b className="font-medium text-red-500">{selectedEvent?.title}</b>{" "}
              - <b className="font-medium">{selectedEvent?.candidate_name}</b>{" "}
              <b className="font-bold">for</b>{" "}
              <b className="font-medium">{selectedEvent?.job_title}</b>{" "}
              <b className="font-bold">Position</b>
            </h2>

            <br />
            <div className="flex justify-between">
              <Link
                to={
                  isRecruiter
                    ? ROUTES.RECRUITER.ONBOARDING.buildPath(
                        {},
                        { id: "" + selectedEvent?.id },
                      )
                    : ROUTES.ADMIN.ONBOARDING.buildPath(
                        {},
                        { id: "" + selectedEvent?.id },
                      )
                }
              >
                <button
                  className="text-xs font-bold text-primary"
                  onClick={() => {
                    console.log("Added review.");
                    setIsOpen(null);
                  }}
                >
                  View
                </button>
              </Link>
              <span className="text-slate-600">
                {dayjs(`${selectedEvent?.interview_date}`).format(
                  "DD MMM YY (HH:mm a)",
                )}
              </span>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </div>
  );
}

function CalendarHeader({
  selectedDate,
  setSelectedDate,
  header,
  calendarType,
  setCalendarType,
}: {
  selectedDate: dayjs.Dayjs;
  setSelectedDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
  header: JSX.Element;
  calendarType: "day" | "week" | "month";
  setCalendarType: React.Dispatch<
    React.SetStateAction<"day" | "week" | "month">
  >;
}) {
  return (
    <div className="sticky top-0 z-10 w-full bg-white">
      <div className=" flex items-center justify-between p-2 px-4">
        <div className="flex items-center gap-x-2">
          <button onClick={() => setSelectedDate(dayjs())}>Today</button>
          <button className="rounded-full border border-slate-500 p-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-4 w-4"
              onClick={() => {
                match(calendarType)
                  .with("day", () =>
                    setSelectedDate((prev) => prev.subtract(1, "day")),
                  )
                  .with("week", () =>
                    setSelectedDate((prev) =>
                      prev.subtract(1, "week").set("day", 1),
                    ),
                  )
                  .with("month", () =>
                    setSelectedDate((prev) =>
                      prev.subtract(1, "month").set("day", 1),
                    ),
                  )
                  .exhaustive();
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button className="rounded-full border border-slate-500 p-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
              onClick={() => {
                match(calendarType)
                  .with("day", () =>
                    setSelectedDate((prev) => prev.add(1, "day")),
                  )
                  .with("week", () =>
                    setSelectedDate((prev) =>
                      prev.add(1, "week").set("day", 1),
                    ),
                  )
                  .with("month", () =>
                    setSelectedDate((prev) =>
                      prev.add(1, "month").set("day", 1),
                    ),
                  )
                  .exhaustive();
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
        <div>{selectedDate.format("MMMM YYYY")}</div>
        <div className="space-x-2 rounded-lg bg-blue-300 px-1  py-1">
          {(["day", "week", "month"] as const).map((e, i) => (
            <button
              key={i}
              className={clsx(
                "rounded-lg px-3 py-1 capitalize",
                calendarType === e ? "bg-white" : "",
              )}
              onClick={() => setCalendarType(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      {header}
    </div>
  );
}

const WeekHeader = ({
  selectedDate,
  calendarType,
}: {
  selectedDate: dayjs.Dayjs;
  calendarType: "day" | "week" | "month";
}) => {
  const weekDays = useMemo(
    () => getCalendarByWeek(selectedDate),
    [selectedDate],
  );
  return match(calendarType)
    .with("day", () => (
      <div className="flex items-center justify-center border-y border-slate-300 py-4">
        {selectedDate.format("DD MMM")}
      </div>
    ))
    .with("week", () => (
      <div className="grid grid-cols-8  divide-x border-y">
        <div />
        {weekDays.map((e, i) => (
          <div className="flex flex-col items-center p-2 text-center" key={i}>
            <div className={clsx(e.isSame(dayjs(), "day") && "text-primary")}>
              {e.format("ddd")}
            </div>
            <div
              className={clsx(
                "inline-block",
                e.isSame(dayjs(), "day") &&
                  "flex h-8 w-8 items-center justify-center rounded-full border bg-primary p-2 text-white",
              )}
            >
              {e.format("DD")}
            </div>
          </div>
        ))}
      </div>
    ))
    .with("month", () => (
      <div className="grid grid-cols-7  divide-x border-y">
        {weekDays.map((e, i) => (
          <div className="p-2 text-center" key={i}>
            <div>{e.format("ddd")}</div>
          </div>
        ))}
      </div>
    ))
    .exhaustive();
};

function getCalendarByDate(date: dayjs.Dayjs) {
  const dates: dayjs.Dayjs[] = [];
  const dt = date.startOf("month");
  const startOfDayInWeek = dt.get("day");
  console.log(startOfDayInWeek);
  for (let i = 0; i < startOfDayInWeek; i++) {
    dates.push(dt.subtract(startOfDayInWeek - i, "day"));
  }
  for (let i = 0; i < date.daysInMonth(); i++) {
    dates.push(dt.add(i, "day"));
  }
  const remainingDays = 7 - (dates.length % 7);
  for (let i = 0; i < remainingDays; i++) {
    dates.push(dt.add(date.daysInMonth() + i, "day"));
  }

  return dates;
}
export function getCalendarByWeek(date: dayjs.Dayjs) {
  const dates: dayjs.Dayjs[] = new Array(7).fill(0);
  const dt = date.startOf("week");
  return dates.map((_, i) => dt.add(i, "day"));
}
