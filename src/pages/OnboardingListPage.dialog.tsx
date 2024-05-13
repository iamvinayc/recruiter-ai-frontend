import {
  OnboardingHistoryResponseType,
  OnboardingStatusMap,
  axiosApi,
} from "@/api/api";
import { FlatList } from "@/components/FlatList";
import { PopupDialog } from "@/components/PopupDialog";
import { Button } from "@/components/common/Button";
import { TextArea } from "@/components/common/Input";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import { replaceWith } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { BellIcon, Check, MessageSquareMoreIcon, PenIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { match } from "ts-pattern";
import { z } from "zod";

//#region OnboardingHistoryModal
export function OnboardingHistoryModal({
  selected,
  onFollowUpClick,
}: {
  selected: {
    onboardingId: number;
    candidateId: number;
  };
  onFollowUpClick: () => void;
}) {
  const onboardingHistory = useQuery({
    queryKey: ["onboardingHistory", selected.onboardingId],
    queryFn: () =>
      axiosApi({
        method: "GET",
        url: replaceWith(
          "onboarding/history/:candidateId/:onboardingId/",
          "onboarding/history/:candidateId/:onboardingId/"
            .replace(":onboardingId", selected.onboardingId.toString())
            .replace(":candidateId", selected.candidateId.toString()),
        ),
      }).then((e) => e.data.data),
  });
  const [addingCommentId, setAddingCommentId] = useState("");
  return (
    <div>
      <div className="mt-3 max-h-[70vh] overflow-y-auto">
        <FlatList
          data={onboardingHistory.data || []}
          isLoading={onboardingHistory.isFetching}
          loadingComponent={
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <SpinnerIcon className="text-slate-400" />
              <div>Loading...</div>
            </div>
          }
          noDataComponent={
            <div className="flex h-full w-full items-center justify-center gap-4">
              No data
            </div>
          }
        >
          <div className=" mb-4 space-y-3">
            {onboardingHistory.data?.map((e, i) => (
              <div
                key={i}
                className="rounded-md rounded-bl-none border border-slate-200 p-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  {match(e.type as OnboardingHistoryResponseType)
                    .with("comment", () => (
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-primary p-2">
                          <MessageSquareMoreIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>Comment</div>
                      </div>
                    ))
                    .with("status_change", () => (
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-green-600 p-2">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <div>Status Change</div>
                      </div>
                    ))
                    .with("notification", () => (
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-yellow-500 p-2">
                          <BellIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>Notification</div>
                      </div>
                    ))
                    .exhaustive()}
                  <div className="text-sm font-medium">
                    {e.datetime
                      ? dayjs(e.datetime).format("DD MMM YYYY hh:mm A")
                      : ""}
                  </div>
                </div>
                <div className="mt-2">
                  {e.type === "status_change"
                    ? convertStatusTitle(e.title)
                    : e.title}
                </div>

                {e.related_message && (
                  <div className="mt-2">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <div className="font-semibold">Message</div>
                      <div>
                        {e.related_date
                          ? " - " +
                            dayjs(e.related_date).format("DD MMM YYYY hh:mm A")
                          : ""}
                      </div>
                    </div>
                    <div>{e.related_message}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FlatList>
      </div>
      <div className="mt-2 flex items-center justify-between text-white">
        <Button
          className="items-center space-x-2 py-2"
          onClick={() => {
            setAddingCommentId(selected.onboardingId.toString());
          }}
        >
          <MessageSquareMoreIcon className="h-4 w-4" />

          <span>Add Comment</span>
        </Button>
        <Button className="space-x-2 py-2" onClick={onFollowUpClick}>
          <PenIcon className="h-4 w-4" />
          <span>Edit Status</span>
        </Button>
      </div>
      <OnboardingCommentModal
        commentingId={addingCommentId}
        closeModal={(needRefetch) => {
          setAddingCommentId("");
          if (needRefetch) {
            onboardingHistory.refetch();
          }
        }}
      />
    </div>
  );
}

//#endregion
export function OnboardingCommentModal({
  commentingId,
  closeModal,
}: {
  commentingId: string;
  closeModal: (needRefetch?: boolean) => void;
}) {
  const addComment = useMutation({
    mutationKey: ["addComment"],
    mutationFn: ({ comment }: { comment: string }) => {
      const data = new FormData();
      data.append("comment", comment);
      return axiosApi({
        method: "POST",
        url: replaceWith(
          "onboarding/comments/:onboardingId/",
          "onboarding/comments/:onboardingId/".replace(
            ":onboardingId",
            commentingId.toString(),
          ),
        ),
        data,
      }).then((e) => e.data.isSuccess);
    },
  });
  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { comment: "" },
  });
  const onSubmit = (data: z.infer<typeof commentFormSchema>) => {
    addComment
      .mutateAsync(data)
      .then((e) => {
        if (e) {
          form.reset();
          closeModal(true);
          toast.success("Comment added successfully");
        } else {
          throw new Error("Failed to add comment");
        }
      })
      .catch(() => {
        toast.error("Failed to add comment");
      });
  };
  return (
    <PopupDialog
      isOpen={!!commentingId}
      setIsOpen={() => closeModal()}
      title="Add Comment"
      showXMarkIcon
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mt-4  overflow-y-auto">
          <Controller
            control={form.control}
            name="comment"
            render={({ field, fieldState }) => (
              <TextArea
                label="Comment"
                placeholder="Add Comment"
                className="h-[40vh]"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="mt-2 flex items-center justify-end text-white">
          <Button type="submit" isLoading={addComment.isPending}>
            Add Comment
          </Button>
        </div>
      </form>
    </PopupDialog>
  );
}
const commentFormSchema = z.object({
  comment: z.string().min(1),
});
const convertStatusTitle = (text: string) => {
  let finalString = text;
  Object.entries(OnboardingStatusMap).forEach(([key, value]) => {
    finalString = finalString.replace(key, value);
  });
  return finalString.replace(" - ", " → ");
};
