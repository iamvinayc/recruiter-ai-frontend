"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { SelectRangeEventHandler } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

export function DatePickerWithRange({
  className,
  title,
  selectedFromDate,
  selectedToDate,
  setSelectedFromDate,
  setSelectedToDate,
  btnClassName,
}: React.HTMLAttributes<HTMLDivElement> & {
  selectedFromDate: string;
  selectedToDate: string;
  setSelectedToDate: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFromDate: React.Dispatch<React.SetStateAction<string>>;
  btnClassName?: string;
}) {
  const date =
    selectedFromDate && selectedToDate
      ? {
          from: dayjs(selectedFromDate, "DD-MM-YYYY").toDate(),
          to: dayjs(selectedToDate, "DD-MM-YYYY").toDate(),
        }
      : undefined;
  const setDate: SelectRangeEventHandler = (dateRange) => {
    if (dateRange) {
      setSelectedFromDate(dayjs(dateRange.from).format("DD-MM-YYYY"));
      setSelectedToDate(dayjs(dateRange.to).format("DD-MM-YYYY"));
    } else {
      setSelectedFromDate("");
      setSelectedToDate("");
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <div>
          <label className="mb-2.5 ml-1 block font-medium text-black dark:text-white">
            {title}
          </label>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                " w-full justify-between rounded-none px-2 text-left font-normal",
                !date && "text-muted-foreground",
                btnClassName,
              )}
            >
              <div>
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd LLL yy")} -{" "}
                      {format(date.to, "dd LLL yy")}
                    </>
                  ) : (
                    format(date.from, "dd LLL yy")
                  )
                ) : (
                  "Pick a date range"
                )}
              </div>
              <CalendarIcon />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="z-999 w-auto" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
