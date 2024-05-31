import { axiosApi } from "@/api/api";
// import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/routes/routes";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
// const AGREEMENT_URL =
//   "https://recruiter-ai.s3.eu-central-1.amazonaws.com/agreements/employer.pdf";

export default function EmployerAgreementPage() {
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [{ employer }] = useTypedSearchParams(ROUTES.EMPLOYER.AGREEMENT);
  const navigate = useNavigate();

  // const [file, setFile] = useState<File | null>(null);
  const fileUploadMutation = useMutation({
    mutationKey: ["fileUploadMutation", employer],
    mutationFn: async () => {
      // if (!file) {
      //   toast.error("Please select the signed agreement");
      //   return false;
      // }
      // const data = new FormData();
      // data.append("agreement", file);
      return axiosApi({
        method: "POST",
        url: "data-sourcing/employer/show_interest/",
        params: {
          employer,
        },
        // data,
      })
        .then((e) => e.data)
        .then((e) => {
          if (e.isSuccess) {
            toast.success("Terms and Conditions Accepted");
            navigate("/");
            return true;
          } else {
            toast.error(e.message || "Some error ocurred");
            return false;
          }
        })
        .catch(() => {
          toast.success("Terms and Conditions Accepted");
          return false;
        });
    },
  });
  const onSubmit = () => {
    if (!isChecked) {
      setMessage('Please agree to the terms and conditions to proceed.');
      return;
    }
    fileUploadMutation.mutateAsync();
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="bg-gray-100 w-full max-w-2xl rounded-md bg-gray p-8 shadow-lg">
        <div className="mb-4">
          <p className="text-gray-700 mb-2 text-lg font-bold">
            Please read and accept the following terms and conditions to proceed:
          </p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Term 1: You must agree to these terms to use our service.</li>
            <li>Term 2: All information provided must be accurate and true.</li>
            <li>Term 3: You are responsible for maintaining the confidentiality of your account.</li>
          </ul>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">I agree to the terms and conditions</span>
          </label>
        </div>
        {message && (
          <div className="mb-4 text-red-500">
            {message}
          </div>
        )}
        <div>
          <Button onClick={onSubmit} isLoading={fileUploadMutation.isPending} className="py-2">
                Accept Terms and Conditions
          </Button>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="flex min-h-screen items-center justify-center bg-blue-100">
  //     <div className="bg-gray-100 w-full max-w-2xl rounded-md bg-gray p-8 shadow-lg">
  //       <div className="space-y-3">
  //         <div className=" text-xl font-bold">Download agreement:</div>
  //         <div>
  //           <a href={AGREEMENT_URL} target="_blank" rel="noreferrer">
  //             <Button className="py-2">Download</Button>
  //           </a>
  //         </div>
  //         <div className=" text-xl font-bold">Upload Signed agreement:</div>
  //         <FileUpload file={file} setFile={setFile} isLoading={false} />
  //         <div onClick={onSubmit} className="flex justify-end">
  //           <Button isLoading={fileUploadMutation.isPending} className="py-2">
  //             Upload
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

}
