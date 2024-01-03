import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTypedSearchParams} from "react-router-typesafe-routes/dom";
import { useMutation } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { axiosApi } from "../api/api";
import { ROUTES } from "@/routes/routes";
import { Button } from "@/components/common/Button";

export const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();
  const [{ employer, candidate, id }] = useTypedSearchParams(ROUTES.FEEDBACKSUBMIT);

  useEffect(() => {
    if (employer && candidate) {
      navigate("/");
    }
  }, [employer, candidate, navigate]);

  const submitFeedbackMutation = useMutation({
    mutationKey: ["submitFeedbackMutation"],
    mutationFn: async () => {
      const payload = {
        onboarding_handle: id,
        candidate_handle: candidate ? candidate : null,
        employer_handle: employer ? employer : null,
        feedback: feedback,
      };

      return axiosApi({
        url: "onboarding/feedback/",
        method: "POST",
        data: payload,
      }).then((response) => {
        if (response.data.isSuccess) {
          toast.success(response.data.message);
          navigate("/");
        } else {
          toast.error(response.data.message);
          navigate("/");
        }
      });
    },
  });

  const handleSubmit = () => {
    if (feedback === "") {
      toast.error("Please enter your feedback.");
      return;
    }
    submitFeedbackMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="bg-gray-100 w-full max-w-3xl rounded-md bg-gray p-8 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold">
          {employer ? "Employer Feedback" : "Candidate Feedback"}
        </h1>
        <textarea
          className="w-full h-64 p-2 mb-4 bg-gray-100"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <Button
          type="submit"
          onClick={handleSubmit}
          isLoading={submitFeedbackMutation.isPending}
          className="py-2"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
