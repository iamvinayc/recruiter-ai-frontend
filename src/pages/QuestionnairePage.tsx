import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import { ROUTES } from "@/routes/routes";
import { emptyArray } from "@/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { FileIcon, Trash2Icon } from "lucide-react";
import React, {
  Dispatch,
  ElementRef,
  SetStateAction,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import PhoneInput, {
  Value as E164Number,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useNavigate } from "react-router-dom";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { axiosApi } from "../api/api";

pdfjs.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.min.js`;

export const QuestionnairePage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<E164Number>("" as E164Number);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: number;
  }>({});
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [{ candidate }] = useTypedSearchParams(ROUTES.QUESTIONNAIRE);
  const [available, setAvailable] = useState(true);
  const [preferContract, setPreferContract] = useState(false);
  const [availableOnDate, setAvailableOnDate] = useState("");
  const [acceptAgreement, setAcceptAgreement] = useState(false);
  const {
    data: questions = emptyArray,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questionnaire", candidate],
    queryFn: async () => {
      const response = await axiosApi({
        url: "onboarding/questionnaire/",
        method: "GET",
        params: { candidate },
      });
      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        toast.error(response.data.message);
        navigate("/");
        return null;
      }
    },
  });

  const handleCheckboxChange = (questionId: number, optionId: number) => {
    setSelectedOptions((prevState) => ({
      ...prevState,
      [questionId]: optionId,
    }));
  };

  const submitQuestionnaireMutation = useMutation({
    mutationKey: ["submitQuestionnaireMutation"],
    mutationFn: async (payload: {
      questionnaire: {
        question_id: number;
        selected_option_id: number;
      }[];
      availability: {
        available: boolean;
        available_on: string;
      };
      prefer_contract: boolean;
      file_token: string;
      phone_number: string;
    }) =>
      axiosApi({
        url: "onboarding/questionnaire_submit/",
        method: "POST",
        params: { candidate },
        data: payload,
      }).then((response) => {
        if (response.data.isSuccess) {
          toast.success("Questionnaire Submitted Successfully!");
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      }),
  });

  const fileUploadMutation = useMutation({
    mutationKey: ["fileUploadMutation", candidate],
    mutationFn: async (data?: FormData) => {
      // return {
      //   data: {
      //     file_token: "candidates/73Sahal Rasheed Resume.pdf",
      //   },
      //   message: "Success",
      //   isSuccess: true,
      //   status: 200,
      // };
      return axiosApi({
        method: "POST",
        url: "onboarding/resume_upload/",
        params: {
          candidate,
        },
        data,
      }).then((e) => e.data);
    },
  });

  const handleSubmit = async () => {
    console.log(preferContract, available, file);
    if (!phoneNumber) {
      toast.error("Please enter your mobile number.");
      return;
    }
    if (!acceptAgreement) {
      toast.error("Please accept the terms & agreement");
      return;
    }
    if (Object.keys(selectedOptions).length !== questions?.length) {
      toast.error("Please answer all the questions.");
      return;
    }

    if (!available && !availableOnDate) {
      toast.error("Please select the date of availability.");
      return;
    }
    const formData = new FormData();
    let file_token = "";
    if (file) {
      formData.append("resume", file);
      await fileUploadMutation.mutateAsync(formData).then((e) => {
        if (!e.isSuccess) {
          toast.error(e.message);
          return;
        }
        file_token = e.data.file_token;
      });
    }

    const payload = Object.entries(selectedOptions).map(
      ([questionId, optionId]) => ({
        question_id: Number(questionId),
        selected_option_id: Number(optionId),
      }),
    );

    return submitQuestionnaireMutation.mutate({
      questionnaire: payload,
      availability: {
        available: available,
        available_on:
          availableOnDate && !available
            ? dayjs(availableOnDate, "YYYY-MM-DD").format("DD-MM-YYYY")
            : "",
      },
      file_token: file_token,
      prefer_contract: preferContract,
      phone_number: phoneNumber,
    });
  };

  const phoneNumberValidator = phoneNumber
    ? isValidPhoneNumber(phoneNumber)
      ? undefined
      : "Invalid phone number"
    : "Phone number required";
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="bg-gray-100 w-full max-w-2xl rounded-md bg-gray p-8 shadow-lg">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error occurred</div>
        ) : (
          <div className="space-y-4">
            <h1 className="mb-4 text-center text-2xl font-bold">
              Candidate Questionnaire
            </h1>
            {/* <Input
              type="number"
              label="Mobile Number"
              value={phoneNumber}
              placeholder="Enter your mobile number"
              className="border-slate-400 bg-slate-100"
              onInput={(e) => {
                setPhoneNumber(e.currentTarget.value);
              }}
            /> */}
            <PhoneInput
              international
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => e && setPhoneNumber(e)}
              className="overflow-hidden rounded-md border border-stroke bg-white pl-4"
              error={phoneNumberValidator}
            />

            {phoneNumber !== "" && phoneNumberValidator ? (
              <span className="mt-2 text-sm text-red-500">
                {phoneNumberValidator}
              </span>
            ) : null}
            {questions?.map((question) => (
              <div key={question.id}>
                <p className="mb-2 font-bold">{question.question}</p>
                {question.options.map((option) => (
                  <label key={option.id} className="mb-1 flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={selectedOptions[question.id] === option.id}
                      onChange={() =>
                        handleCheckboxChange(question.id, option.id)
                      }
                      className="mr-2"
                    />
                    {option.option}
                  </label>
                ))}
              </div>
            ))}
            <div className="space-y-2">
              <label className="mb-2 font-bold">Are you available?</label>
              <div>
                <label htmlFor="yes">
                  <input
                    name="available"
                    type="radio"
                    className="mx-2"
                    id="yes"
                    checked={available}
                    onChange={() => setAvailable(true)}
                  />
                  Yes
                </label>
                <label htmlFor="no">
                  <input
                    name="available"
                    type="radio"
                    className="mx-2"
                    id="no"
                    checked={!available}
                    onChange={() => setAvailable(false)}
                  />
                  No{" "}
                </label>
              </div>
              {!available ? (
                <Input
                  type="date"
                  containerClassName="ml-4"
                  className="w-auto bg-white"
                  label="When are you available?"
                  value={availableOnDate}
                  min={dayjs().format("YYYY-MM-DD")}
                  onChange={(e) => {
                    const dt = e.target.value;
                    setAvailableOnDate(dt);
                  }}
                />
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="mb-2 font-bold">
                Are you seeking a Job or Project?
              </label>
              <div>
                <label htmlFor="Job">
                  <input
                    name="job_or_project"
                    type="radio"
                    className="mx-2"
                    id="Job"
                    checked={!preferContract}
                    onChange={() => setPreferContract(false)}
                  />
                  Job
                </label>
                <label htmlFor="Project">
                  <input
                    name="job_or_project"
                    type="radio"
                    className="mx-2"
                    id="Project"
                    checked={preferContract}
                    onChange={() => setPreferContract(true)}
                  />
                  Project
                </label>
              </div>
            </div>
            <FileUpload
              file={file}
              setFile={setFile}
              isLoading={fileUploadMutation.isPending}
            />
            <div className=" text-lg font-bold">Terms and conditions</div>
            <Document
              className="h-[400px] overflow-x-auto bg-slate-200"
              file="/Privacy Policy Example Document.pdf"
              // file="https://recruiter-ai.s3.eu-central-1.amazonaws.com/agreements/candidate.pdf"
              // file="https://img1.digitallocker.gov.in/nad/assets/user_manual/dl_fetch_document.pdf"
            >
              <Page pageNumber={1} />
            </Document>
            <div className="pt-2">
              <label className="text-lg font-bold">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={acceptAgreement}
                  onChange={(e) => setAcceptAgreement(e.target.checked)}
                />
                I accept the terms and conditions mentioned above
              </label>
            </div>
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={
                submitQuestionnaireMutation.isPending ||
                fileUploadMutation.isPending
              }
              className="py-2"
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const FileUpload = ({
  file,
  setFile,
  isLoading,
}: {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  isLoading: boolean;
}) => {
  const fileRef = useRef<ElementRef<"input">>(null);

  const resetFile = () => {
    setFile(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };
  return (
    <>
      <p className="mb-2 font-bold">Resume</p>

      {file ? (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="relative flex cursor-move select-none flex-col items-center overflow-hidden rounded border bg-white pt-[100%] text-center">
            <button
              className="absolute  right-0 top-0 z-50 rounded-bl bg-white p-2 focus:outline-none"
              type="button"
              onClick={resetFile}
            >
              {isLoading ? (
                <SpinnerIcon className="m-0 text-primary" />
              ) : (
                <Trash2Icon size={18} />
              )}
            </button>
            <FileIcon
              size={24}
              className="text-gray-400 absolute top-1/2 h-12 w-12 -translate-y-2/3 transform"
            />

            <div className="absolute bottom-0 left-0 right-0 flex flex-col bg-white bg-opacity-50 p-2 text-xs">
              <span className="text-gray-900 w-full truncate font-bold">
                {file.name}
              </span>
              <span className="text-gray-900 text-xs">
                {(file.size / 1024).toFixed(2)} kB
              </span>
            </div>

            <div className="absolute inset-0 z-40 transition-colors duration-300"></div>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 border-gray-200 relative flex cursor-pointer flex-col rounded border border-dashed bg-white">
          <input
            ref={fileRef}
            accept="application/pdf"
            type="file"
            className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
            title=""
            onChange={(e) => {
              const file = e.target?.files?.[0];
              if (file) {
                setFile(file);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileIcon size={34} className="text-current-50 mr-1 h-6 w-6" />

            <p className="m-0">Drag your files here or click in this area.</p>
          </div>
        </div>
      )}
    </>
  );
};
