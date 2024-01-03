import React, { useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { axiosApi } from "../api/api";
import { ROUTES } from "@/routes/routes";
import { Button } from "@/components/common/Button";

export const EmployerCandidateSubmitPage: React.FC = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const navigate = useNavigate();
  const [{ employer }] = useTypedSearchParams(ROUTES.EMPLOYER.CANDIDATE_SUBMIT);

  const { data, isLoading, error } = useQuery({
    queryKey: ["employerScoring", employer],
    queryFn: async () => {
      const response = await axiosApi({
        url: "onboarding/employer/scoring/",
        method: "GET",
        params: { employer },
      });
      if (response.data.isSuccess) {
        return response.data.data;
      } else {
        toast.error(response.data.message);
        navigate("/");
      }
    },
  });

  const submitCandidateMutation = useMutation({
    mutationKey: ["submit-candidates", employer, data, selectedCandidates],
    mutationFn: async () => {
      const payload = {
        employer_email: employer,
        jobs: data
          ? data.map((job) => ({
              job_id: job.job_id,
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
              <>
                {data?.map((job) => (
                  <div key={job.job_id} className="mb-4">
                    <p className="mb-2 font-bold">{job.job_title}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full whitespace-nowrap">
                        <thead>
                          <tr className="text-gray-500 bg-gray-50 border-b text-left text-xs font-semibold uppercase tracking-wide">
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
