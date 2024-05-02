import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import dayjs from "dayjs";
import { CheckCircle2Icon, ListTodoIcon } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { EventItem, getCalendarByWeek } from "./EventCalendar";
import { SpinnerIcon } from "./common/SvgIcons";

export function EventTodo({
  events_data,
  isLoading,
  selectedDate,
  setSelectedDate,
}: {
  events_data: EventItem[];
  isLoading: boolean;
  selectedDate: dayjs.Dayjs;
  setSelectedDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
}) {
  const { isRecruiter } = useLogin();
  const dates = useMemo(() => getCalendarByWeek(dayjs()), []);
  const events = events_data.filter((e) =>
    dayjs(e.interview_date).isSame(selectedDate, "day"),
  );
  return (
    <div className="relative flex flex-1 flex-col border p-2">
      {isLoading && (
        <div className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-slate-700 bg-opacity-40">
          <SpinnerIcon className="mt-4 h-6 w-6 " />
        </div>
      )}
      <div className="grid grid-cols-7 gap-4">
        {dates.map((date, i) => (
          <button
            key={i}
            className={cn(
              "space-y-2 rounded-lg border py-2 text-center shadow-md",
              selectedDate.isSame(date, "day")
                ? "bg-black text-white"
                : "bg-white text-black",
            )}
            onClick={() => setSelectedDate(date)}
          >
            <div className="text-sm font-medium">{date.format("MMMM")}</div>
            <div className="text-base font-bold">{date.format("D")}</div>
            <div className="text-sm font-medium">{date.format("ddd")}</div>
          </button>
        ))}
      </div>
      <div
        className={cn(
          "mt-4 flex-1 space-y-2 overflow-y-auto",
          events.length === 0 ? "flex items-center justify-center" : "",
        )}
      >
        {events.map((event) => (
          <div key={event.id}>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.ONBOARDING.buildPath(
                      {},
                      { id: "" + event?.id },
                    )
                  : ROUTES.ADMIN.ONBOARDING.buildPath(
                      {},
                      { id: "" + event?.id },
                    )
              }
            >
              <div className="flex items-center gap-x-3 rounded-lg border p-2 shadow-md">
                <div>
                  <CheckCircle2Icon size={24} className="text-green-500" />
                </div>
                <div className="flex flex-grow flex-col">
                  <div className="text-sm font-medium">Reminder</div>
                  <div className="text-sm">
                    <h2>
                      <b className="font-medium text-red-500">{event?.title}</b>{" "}
                      - <b className="font-medium">{event?.candidate_name}</b>{" "}
                      <b className="font-bold">for</b>{" "}
                      <b className="font-medium">{event?.job_title}</b>{" "}
                      <b className="font-bold">Position</b>
                    </h2>
                  </div>
                </div>

                <div>
                  <div className="whitespace-nowrap text-xs">
                    {dayjs(event.interview_date).format("HH:mm A")}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-y-2">
            <ListTodoIcon size={38} />
            <div>No TODO for {selectedDate.format("MMMM D, YYYY")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
