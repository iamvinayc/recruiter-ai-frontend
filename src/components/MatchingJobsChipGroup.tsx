import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

export function MatchingJobsChipGroup({
  items,
  showAll = false,
  className,
}: {
  items: { id: number; name: string; score: number }[];
  showAll?: boolean;
  className?: string;
  navigate?: boolean;
}) {
  const [showMore, setShowMore] = useState(showAll);
  const { isRecruiter } = useLogin();
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-2">
      {items
        .filter((_, i) => (showMore ? true : i < 2))
        .map(({ id, name, score }) => (
          <Link
            target="_blank"
            to={
              isRecruiter
                ? ROUTES.RECRUITER.LIST_JOBS.buildPath(
                    {},
                    {
                      id: id.toString(),
                    },
                  )
                : ROUTES.ADMIN.LIST_JOBS.buildPath(
                    {},
                    {
                      id: id.toString(),
                    },
                  )
            }
            key={id}
          >
            <button
              key={id}
              className={cn(
                " inline-flex items-center  text-ellipsis  rounded-none  bg-purple-600 p-3 px-2 py-1 font-bold text-white hover:bg-opacity-90",
                className,
              )}
            >
              {name}
            </button>
            <span className="block bg-black p-2 text-center text-white ">
              Score: {score}
            </span>
          </Link>
        ))}
      {items.length > 2 && !showMore ? (
        <button
          onClick={() => setShowMore(true)}
          className={
            "inline-flex rounded-none border bg-yellow-500 px-2 py-1  font-medium text-white hover:opacity-80"
          }
        >
          More...
        </button>
      ) : null}
    </div>
  );
}
