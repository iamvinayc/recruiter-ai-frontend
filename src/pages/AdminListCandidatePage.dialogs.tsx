import { ResumeFileUploadResponse, axiosApi } from "@/api/api";
import { PopupDialog } from "@/components/PopupDialog";
import { Button } from "@/components/common/Button";
import { ChipGroup } from "@/components/common/ChipGroup";
import { Input, TextArea } from "@/components/common/Input";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import { emptyArray, replaceWith } from "@/utils";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const EditCandidateDialog = ({
  selectedUser,
  closeDialog,
}: {
  selectedUser?: Candidate;
  closeDialog: (success?: boolean) => void;
}) => {
  const [description, setDescription] = useState("");
  const uploadResumeFile = useMutation({
    mutationKey: ["uploadResumeFile2"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      return axiosApi({
        url: "data-sourcing/candidate/resume_upload/",
        method: "POST",
        data: formData,
      })
        .then((e) => e.data.data)
        .then(async (e) => {
          setUploadData(e);
          return e;
        });
    },
  });
  const [uploadData, setUploadData] = useState<
    ResumeFileUploadResponse | undefined
  >(undefined);

  const id = "" + selectedUser?.id?.toString();
  const updateResume = useMutation({
    mutationKey: ["updateResume", id],
    mutationFn: async ({
      description,
      resume_data,
    }: {
      description?: string;
      resume_data?: ResumeFileUploadResponse;
    }) => {
      return axiosApi({
        url: replaceWith(
          "data-sourcing/candidate/:id",
          "data-sourcing/candidate/:id".replace(":id", id) + "/",
        ),
        method: "PUT",
        data: {
          description,
          resume_data: resume_data,
        },
      })
        .then((e) => e.data.data)
        .then(async (e) => {
          return e;
        });
    },
  });

  useEffect(() => {
    setDescription(selectedUser?.description || "");
    return () => {
      setUploadData(undefined);
    };
  }, [selectedUser?.description]);

  const isEdited = description !== selectedUser?.description || !!uploadData;
  console.log("uploadResumeFile.data", uploadResumeFile.data);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdited) {
      updateResume
        .mutateAsync({
          description,
          resume_data: uploadData,
        })
        .then((e) => {
          if (e.id) {
            toast.success("Candidate details updated successfully");
            closeDialog(true);
          } else throw new Error("Failed to update candidate details");
        })
        .catch(() => toast.error("Failed to update candidate details"));
    }
  };
  return (
    <PopupDialog
      isOpen={!!selectedUser?.id}
      setIsOpen={() => closeDialog()}
      title="Edit Candidate Details"
      containerClassName="max-w-[95%] md:max-w-[70%] "
    >
      <div>
        <button
          className="absolute right-0 top-0 p-4"
          onClick={() => closeDialog()}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="mt-4 grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-2">
          <div>
            <div className="rounded-md border">
              <div className="flex items-center space-x-2 border-b p-4 py-3 text-lg font-medium">
                {/* icon */}
                <span>User Info</span>
              </div>
              <div className="divide-y">
                {[
                  ["Name", selectedUser?.name],
                  ["Email", selectedUser?.email],
                  ["Phone", selectedUser?.phone],
                  ["Profile url", selectedUser?.profile_url],
                  ["Resume file", selectedUser?.resume_file],
                  ["Platform", selectedUser?.platform],
                ]
                  .filter((e) => !!e[1])
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col justify-between px-4 py-2 text-sm md:flex-row"
                    >
                      <div className="font-medium">{key}</div>
                      {value?.startsWith("https://") ? (
                        <a
                          href={value}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="truncate text-blue-500"
                          rel="noreferrer"
                        >
                          {value}
                        </a>
                      ) : (
                        <div className="truncate ">{value}</div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {([["Location", selectedUser?.location?.name]] as const).map(
              ([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="font-medium">{key}</div>
                  <div className="text-sm text-slate-700">{value}</div>
                </div>
              ),
            )}
            <div className="space-y-1">
              <div className="font-medium">Skills</div>
              <div className="text-sm ">
                <ChipGroup
                  items={selectedUser?.departments || emptyArray}
                  showAll
                />
              </div>
            </div>
            <form className="space-y-1" onSubmit={onSubmit}>
              <TextArea
                label="Description"
                placeholder="Description"
                className=" px-3 py-3"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                type="file"
                label="Upload Resume"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadResumeFile.mutateAsync(file);
                  }
                }}
                icon={
                  uploadResumeFile.isPending ? (
                    <SpinnerIcon className="m-0 mt-1 p-0 text-primary" />
                  ) : undefined
                }
              />
              <div className="flex items-center justify-center pt-4">
                <Button
                  disabled={!isEdited}
                  isLoading={updateResume.isPending}
                  type="submit"
                  className="py-2 disabled:border-slate-800 disabled:bg-slate-700"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PopupDialog>
  );
};
interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile_url: string;
  resume_file: string;
  platform: string;
  location: {
    name: string;
  };
  departments: { id: number; name: string }[];
  description?: string;
}
