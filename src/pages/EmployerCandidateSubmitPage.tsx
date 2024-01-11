import React, { useEffect, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { axiosApi } from "../api/api";
import { ROUTES } from "@/routes/routes";
import { Button } from "@/components/common/Button";

interface MoreOptionsProps {
  prefer_contract: boolean;
  expired: boolean;
  job_id: string;
}
export const EmployerCandidateSubmitPage: React.FC = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [moreOptions, setMoreOptions] = useState<MoreOptionsProps[]>([]);
  const navigate = useNavigate();
  const [{ employer }] = useTypedSearchParams(ROUTES.EMPLOYER.CANDIDATE_SUBMIT);

  const { data, isLoading, error } = useQuery({
    queryKey: ["employerScoring", employer],
    queryFn: async () => {
      return [
        {
            "job_id": "gAAAAABlgZ4fP-mgGXJZJVuzZIOISAj3XhIFeBYna38AT1c-JK9NDxub98as5ibanT9sQhqr48pM5yWMBdyQy0v49umEkQsY5g==",
            "job_title": "Python FUll Stack",
            "candidates": [
                {
                    "candidate_id": "gAAAAABlgZ4fNNtaWtbO1AygOrwMFnla-V-JgBvXdshzgZE7v3vAtHl5OBW8wMY6TD1kssIqjVOSbz5mUuZYcMk4X2nEhfSQ9g==",
                    "candidate_name": "Test Sahal Updated",
                    "reasons": "Lack of Python Experience: The resume does not mention any experience or skills specifically related to Python development, which is a key requirement for the job of a Python Django Engineer (0/100).#$No Relevant Responsibilities or Achievements: The resume does not provide any specific details about the candidate's responsibilities or achievements in their previous roles, making it difficult to assess their suitability for a Python Django Engineer position (0/100).#$Limited Information on Programming Skills: While the candidate has experience and expertise in Django development, the resume does not provide sufficient information about their proficiency in Python programming, which is essential for the role of a Python Django Engineer (0/100).#$No Mention of RESTful API Development: The job description specifically mentions the need for experience in creating RESTful APIs, but the resume does not provide any information about the candidate's experience in this area (0/100).#$Limited Information on Database Management: The resume mentions experience with databases like PostgreSQL, MySQL, or SQLite, but does not provide details about the candidate's experience in managing databases or optimizing SQL queries, which are crucial skills for a Python Django Engineer (0/100).#$No Mention of Testing and Debugging: The job description highlights the importance of experience in testing, debugging, and maintaining code quality using frameworks like pytest, but the resume does not mention any experience or skills in this area (0/100)."
                }
            ]
        }
    ]
      // const response = await axiosApi({
      //   url: "onboarding/employer/scoring/",
      //   method: "GET",
      //   params: { employer },
      // });
      // if (response.data.isSuccess) {
      //   return response.data.data;
      // } else {
      //   toast.error(response.data.message);
      //   navigate("/");
      // }
    },
  });
  useEffect(() => {
    if (Array.isArray(data)) {
      setMoreOptions(
        data.map((e) => ({
          job_id: e.job_id,
          prefer_contract: false,
          expired: false,
        })),
      );
    }
  }, [data]);

  const submitCandidateMutation = useMutation({
    mutationKey: ["submit-candidates", employer, data, selectedCandidates],
    mutationFn: async () => {
      const payload = {
        employer_email: employer,
        jobs: data
          ? data.map((job, i) => ({
              job_id: job.job_id,
              prefer_contract: moreOptions[i].prefer_contract,
              expired: moreOptions[i].expired,
              candidates: job.candidates
                .filter((candidate) =>
                  selectedCandidates.includes(candidate.candidate_id),
                )
                .map((candidate) => ({ candidate_id: candidate.candidate_id })),
            }))
          : [],
      };
      const response = await axiosApi({
        url: "onboarding/employer/candidate_submit/",
        method: "POST",
        data: payload,
      });
      if (response.data.isSuccess) {
        toast.success("Candidates Onboarded Successfully!");
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    },
  });

  const handleCheckboxChange = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId],
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="bg-gray-100 w-full max-w-7xl rounded-md bg-gray p-8 shadow-lg">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error occurred</div>
        ) : (
          <>
            <h1 className="mb-4 text-center text-2xl font-bold">
              Matching Candidates Details
            </h1>
            {data?.length === 0 ? (
              <div>
                <h3 className="text-center font-semibold">
                  No matching candidates
                </h3>
              </div>
            ) : (
              <div>
                {data?.map((job, index) => (
                  <div key={job.job_id} className="mb-4">
                    <p className="mb-2 font-bold">{job.job_title}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full whitespace-nowrap">
                        <thead>
                          <tr className="text-gray-500 border-b bg-slate-200 text-left text-xs font-semibold uppercase tracking-wide">
                            <th className="w-1/4 px-4 py-3">Candidate Name</th>
                            <th className="w-3/4 px-4 py-3">Reasons</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y bg-white">
                          {job.candidates.map((candidate) => (
                            <tr
                              key={candidate.candidate_id}
                              className="text-gray-700"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <label className="cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedCandidates.includes(
                                        candidate.candidate_id,
                                      )}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          candidate.candidate_id,
                                        )
                                      }
                                      className="mr-2"
                                    />
                                    <span className="text-sm font-semibold uppercase">
                                      {candidate.candidate_name}
                                    </span>
                                  </label>
                                </div>
                              </td>
                              <td className="text-gray-500 whitespace-normal px-4 py-3 text-sm">
                                {candidate.reasons}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <MoreOptionsComponent
                      setState={(newState) => {
                        if (typeof newState === "function") {
                          setMoreOptions((prev) =>
                            prev.map((e, i) => (i === index ? newState(e) : e)),
                          );
                        } else {
                          setMoreOptions((prev) =>
                            prev.map((e, i) => (i === index ? newState : e)),
                          );
                        }
                      }}
                      state={moreOptions[index]}
                    />
                  </div>
                ))}
                <Button
                  type="submit"
                  onClick={() => {
                    if (selectedCandidates.length === 0) {
                      toast.error(
                        "Please select at least one candidate before submitting.",
                      );
                    } else {
                      submitCandidateMutation.mutate();
                    }
                  }}
                  isLoading={submitCandidateMutation.isPending}
                  className="py-2"
                >
                  Submit
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
const MoreOptionsComponent = ({
  state,
  setState,
}: {
  state: MoreOptionsProps;
  setState: React.Dispatch<React.SetStateAction<MoreOptionsProps>>;
}) => {
  if (!state) return <></>;
  const { expired, job_id, prefer_contract } = state;
  return (
    <div className="flex justify-end  bg-slate-200">
      <div className="space-y-2 p-2">
        <div>
          <label htmlFor={`no-${job_id}`} className="mb-2 font-bold">
            Expired
            <input
              type="checkbox"
              className="mx-2"
              id={`no-${job_id}`}
              checked={expired}
              onChange={() => {
                setState({ ...state, expired: !expired });
              }}
            />
          </label>
        </div>
        <div className="space-2 flex">
          <label className="mb-2 font-bold">Job/Project:</label>
          <div>
            <label htmlFor={`Job-${job_id}`}>
              <input
                name={`job_or_project-${job_id}`}
                type="radio"
                className="mx-2"
                id={`Job-${job_id}`}
                checked={!prefer_contract}
                onChange={(e) => {
                  setState((prev) => ({
                    ...prev,
                    prefer_contract: !e.target.checked,
                  }));
                }}
              />
              Job
            </label>
            <label htmlFor={`Project-${job_id}`}>
              <input
                name={`job_or_project-${job_id}`}
                type="radio"
                className="mx-2"
                id={`Project-${job_id}`}
                checked={prefer_contract}
                onChange={(e) => {
                  console.log(job_id, e.target.checked);
                  setState((prev) => ({
                    ...prev,
                    prefer_contract: e.target.checked,
                  }));
                }}
              />
              Project
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
