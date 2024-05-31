import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

import { ReasonRenderer } from "@/components/ReasonRenderer";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/routes/routes";
import toast from "react-hot-toast";
import { axiosApi } from "../api/api";

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
      // return [
      //   {
      //     job_id: "string",
      //     job_title: "Front end developer doing stuff",
      //     candidates: [
      //       {
      //         candidate_id: "string",
      //         candidate_name: "string",
      //         reasons: [
      //           "Lack of Neo4j Experience: The resume does not mention any experience or skills specifically related to Neo4j (graph) databases, which is a mandatory requirement for the job (0/100).",
      //           "No Mention of PL/SQL Experience: The resume does not provide any specific details about the candidate's experience with PL/SQL, which is a key requirement for the job (0/100).",
      //           "Limited Information on Data Modeling and Optimization: While the candidate has experience in designing and implementing scalable and efficient database solutions, there is no specific mention of expertise in data modeling and database optimization techniques (50/100).",
      //           "No Mention of DBA Certification: The resume does not indicate whether the candidate has a DBA certification, which is preferred for the job (0/100).",
      //           "No Mention of GIS Tools and Libraries: The resume does mention experience with GIS tools and libraries, which is required for the job (100/100).",
      //           "Familiarity with Postgres: The resume mentions familiarity with the internal working of Postgres, which is required for the job (100/100).",
      //           "Limited Information on Concurrency and Reversibility of Transactions: While the candidate mentions expertise in managing concurrency and reversibility of transactions, there is no specific information provided about their experience in this area (50/100).",
      //           "Handling SQL Injection Vulnerabilities: The resume mentions experience in handling SQL injection vulnerabilities, which is required for the job (100/100).",
      //         ],
      //       },
      //     ],
      //   },
      // ];
      const response = await axiosApi({
        url: "onboarding/employer/scoring/",
        method: "GET",
        params: { employer },
      });
      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        toast.error(response.data.message);
        // navigate("/");
      }
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
                  <div key={job.job_id} className="mb-8">
                    <div className="flex flex-col items-center justify-between  gap-4 border-b-2 border-b-[#ddd] bg-slate-200 p-4 md:flex-row">
                      <p className="font-bold">{job.job_title}</p>
                      <MoreOptionsComponent
                        setState={(newState) => {
                          if (typeof newState === "function") {
                            setMoreOptions((prev) =>
                              prev.map((e, i) =>
                                i === index ? newState(e) : e,
                              ),
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
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="text-gray-500 border-b bg-slate-200 text-left text-xs font-semibold uppercase tracking-wide">
                            <th className="w-1/4 px-4 py-3">Candidate Name</th>
                            <th className="w-1/4 px-4 py-3">Skills</th>
                            <th className="w-1/4 px-4 py-3">Details</th>
                            <th className="w-1/4 px-4 py-3">Reasons</th>
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
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {candidate.skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex text-ellipsis rounded bg-[#3BA2B8] px-2 py-1 text-xs font-normal text-white hover:bg-opacity-90"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="text-gray-500 px-4 py-3 text-sm">
                                {candidate.details}
                              </td>
                              <td className="text-gray-500 px-4 py-3 text-sm">
                                <ReasonRenderer reason={candidate.reasons} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                  className="mt-4 py-2"
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
    <>
      <div className="space-y-2">
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
        <div className="space-2 flex  flex-wrap">
          <div className="mb-2 font-bold">Job/Project:</div>
          <div className="flex flex-row flex-wrap">
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
    </>
  );
};
