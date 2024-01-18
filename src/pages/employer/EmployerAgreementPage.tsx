import { axiosApi } from "@/api/api";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/routes/routes";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
const AGREEMENT_URL =
  "https://recruiter-ai.s3.eu-central-1.amazonaws.com/agreements/employer.pdf";

export default function EmployerAgreementPage() {
  const [{ employer }] = useTypedSearchParams(ROUTES.EMPLOYER.AGREEMENT);
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const fileUploadMutation = useMutation({
    mutationKey: ["fileUploadMutation", file, employer],
    mutationFn: async () => {
      if (!file) {
        toast.error("Please select the signed agreement");
        return false;
      }
      const data = new FormData();
      data.append("agreement", file);
      return axiosApi({
        method: "POST",
        url: "data-sourcing/employer/show_interest/",
        params: {
          employer,
        },
        data,
      })
        .then((e) => e.data)
        .then((e) => {
          if (e.isSuccess) {
            toast.success("Agreement uploaded succesfully");
            navigate("/");
            return true;
          } else {
            toast.error(e.message || "Some error ocurred");
            return false;
          }
        })
        .catch(() => {
          toast.success("Agreement uploaded succesfully");
          return false;
        });
    },
  });
  const onSubmit = () => {
    fileUploadMutation.mutateAsync();
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="bg-gray-100 w-full max-w-2xl rounded-md bg-gray p-8 shadow-lg">
        <div className="space-y-3">
          <div className=" text-xl font-bold">Download agreement:</div>
          <div>
            <a href={AGREEMENT_URL} target="_blank" rel="noreferrer">
              <Button className="py-2">Download</Button>
            </a>
          </div>
          <div className=" text-xl font-bold">Upload Signed agreement:</div>
          <FileUpload file={file} setFile={setFile} isLoading={false} />
          <div onClick={onSubmit} className="flex justify-end">
            <Button isLoading={fileUploadMutation.isPending} className="py-2">
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
