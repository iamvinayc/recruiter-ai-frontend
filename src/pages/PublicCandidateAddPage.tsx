import { XMarkIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Document, Page } from "react-pdf";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { SpinnerIcon } from "@/components/common/SvgIcons";
import { ResumeFileUploadResponse, axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";

export const PublicCandidateAddPage = () => {
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
  } = useForm<z.TypeOf<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
      resume_file_uuid: "",
    },
  });
  const resetForm = () => {
    reset({
      city: "",
      name: "",
      email: "",
      phone: "",
      profile_url: "",
      resume_file: "",
      resume_file_uuid: "",
    });
    uploadResumeFile.reset();
  };
  const addCandidateMutation = useMutation({
    mutationKey: ["addCandidateMutation"],
    mutationFn: (
      data: z.TypeOf<typeof formSchema> & {
        resume_data?: ResumeFileUploadResponse;
      },
    ) =>
      axiosApi({
        url: "data-sourcing/public/add_candidate/",
        method: "POST",
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          profile_url: data.profile_url || null,
          handle: `${Math.random()}`,
          location: {
            name: data.city,
          },
          platform: "PUBLIC",
          departments: [],
          resume_data: data.resume_data,
        },
      }).then((e) => e.data),
  });

  const uploadResumeFile = useMutation({
    mutationKey: ["uploadResumeFile"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const resumeFileUUID = getValues("resume_file_uuid");
      if (resumeFileUUID) {
        formData.append("resume_file_uuid", resumeFileUUID);
      }

      return await axiosApi({
        url: "data-sourcing/candidate/resume_upload/",
        method: "POST",
        data: formData,
      })
        .then((e) => e.data.data)
        .then(async (e) => {
          console.log(e);
          const email = e.resume_email;
          const phone = e.resume_phone;
          if (email) {
            setValue("email", email);
          }
          if (phone) {
            setValue("phone", phone);
          }
          setValue("resume_file", e.resume_file);
          setValue("resume_file_uuid", e.resume_file_uuid);
          return e;
        });
    },
  });
  const onSubmit = (data: z.TypeOf<typeof formSchema>) => {
    const { resume_file, ...formData } = data;
    if (!resume_file) {
      toast.error("Please upload your resume.");
      return;
    }
    addCandidateMutation
      .mutateAsync({
        ...formData,
        resume_data: uploadResumeFile.data,
      })
      .then((data) => {
        if (data.isSuccess) {
          toast.success("Added candidate successfully");
          resetForm();
          navigate("/success", { replace: true });
        } else if (data.message) {
          toast.error(data.message);
          if (data.message.toLowerCase().includes("email")) {
            setError("email", { message: JSON.stringify(data.message) });
          }
        } else throw new Error("Some error ocurred");
      })
      .catch(() => toast.error("Some error ocurred"));
  };

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [pdfPreviewURL, setPdfPreviewURL] = useState("");
  return (
    <main>
      <div className="container_wrapper md:my-32 md:p-5 lg:my-11.5 lg:p-0">
        <div className="content border">
          <div className="header lg:my-5">
            <img
              src="https://app.talentpush.nl/static/email/img/logo.png"
              alt="logo"
              className="logo mx-auto"
            />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 space-y-6 lg:space-y-8">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex flex-1 flex-col">
                  <Input
                    label=""
                    placeholder="Name"
                    className="border-gray-300  border px-4 py-2"
                    register={register}
                    name="name"
                    error={errors.name?.message}
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <Input
                    label=""
                    placeholder="Email"
                    type="email"
                    className="border-gray-300  border px-4 py-2"
                    register={register}
                    name="email"
                    error={errors.email?.message}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex flex-1 flex-col gap-4">
                  <Input
                    label=""
                    placeholder="Phone"
                    className="border-gray-300  border px-4 py-2"
                    register={register}
                    name="phone"
                    error={errors.phone?.message}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <Input
                    label=""
                    placeholder="LinkedIn URL"
                    className="border-gray-300  border px-4 py-2"
                    register={register}
                    name="profile_url"
                    type="url"
                    error={errors.profile_url?.message}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex flex-1 flex-col">
                  <Input
                    type="file"
                    label=""
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadResumeFile.mutateAsync(file);
                        setPdfPreviewURL(URL.createObjectURL(file));
                      }
                    }}
                    icon={
                      uploadResumeFile.isPending ? (
                        <SpinnerIcon className="m-0 mt-1 p-0 text-primary" />
                      ) : undefined
                    }
                    error={errors.resume_file?.message}
                    className="border-gray-300  border px-4 py-[5.5px]"
                  />
                  {uploadResumeFile.data && (
                    <button
                      type="button"
                      className="ml-2 text-primary underline"
                      onClick={() => setShowPreview(true)}
                    >
                      Preview
                    </button>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <Input
                    register={register}
                    name="city"
                    label=""
                    placeholder="Location"
                    error={errors.city?.message?.replace("city", "location")}
                    className="border-gray-300  border px-4 py-2"
                  />
                </div>
              </div>
            </div>

            {showPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
                <div className="relative max-h-full max-w-full overflow-auto  bg-white p-4">
                  <button
                    className="text-gray-500 hover:text-gray-700 fixed right-4 top-4 z-10 rounded-full bg-white p-2"
                    onClick={() => setShowPreview(false)}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <Document file={pdfPreviewURL}>
                    <Page pageNumber={1} />
                  </Document>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 lg:py-4">
              <Button
                type="reset"
                onClick={resetForm}
                className="border-none bg-red-500 p-4 px-10 py-2"
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="border-none bg-green-500 px-11.5 py-2"
                disabled={
                  uploadResumeFile.isPending || addCandidateMutation.isPending
                }
                isLoading={addCandidateMutation.isPending}
              >
                Join
              </Button>
            </div>
          </form>
        </div>
        <div className="footer space-y-6 lg:h-[350px] lg:space-y-8 lg:py-15">
          <div className="socials">
            <a href="#">
              <img src="https://app.talentpush.nl/static/email/img/fb.png" />
            </a>
            <a href="#">
              <img src="https://app.talentpush.nl/static/email/img/twitter.png" />
            </a>
            <a href="#">
              <img src="https://app.talentpush.nl/static/email/img/instagram.png" />
            </a>
            <a href="#">
              <img src="https://app.talentpush.nl/static/email/img/linkedin.png" />
            </a>
          </div>

          <p className="address">Michelangelostraat 21-2 1077 BP Amsterdam</p>

          <div className="contact">
            <a href="mailto:info@talentpush.nl">
              <img src="https://app.talentpush.nl/static/email/img/email.png" />
              info@talentpush.nl
            </a>
            <a href="www.talentpush.nl" target="_blank" rel="noreferrer">
              <img
                src="https://static.thenounproject.com/png/365220-200.png"
                style={{
                  filter:
                    "invert(80%) sepia(37%) saturate(3333%) hue-rotate(167deg) brightness(95%) contrast(80%)",
                }}
              />
              &#173;www.talentpush&#173;.nl
            </a>
          </div>
          <p className="copyright">Copyright © 2024 | All rights reserved .</p>
        </div>
      </div>
    </main>
  );
};

//#region form
const formSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email(),
  phone: z.string().min(1, "Please enter phone"),
  profile_url: z.string(),
  resume_file: z.string().optional(),
  city: z.string().min(1, "Please enter a city"),
  resume_file_uuid: z.string().optional(),
});
//#endregion form
