import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import { axiosApi } from "../api/api";
import { ROUTES } from "@/routes/routes";
import { Button } from "@/components/common/Button";
export const QuestionnairePage: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: number;
  }>({});
  const navigate = useNavigate();
  const [{ candidate }] = useTypedSearchParams(ROUTES.QUESTIONNAIRE);

  const {
    data: questions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questionnaire", { candidate }],
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
      }
    },
  });

  const handleCheckboxChange = (questionId: number, optionId: number) => {
    setSelectedOptions((prevState) => ({
      ...prevState,
      [questionId]: optionId,
    }));
  };

  const submitQuestionnairetMutation = useMutation({
    mutationKey: ["submitQuestionnairetMutation"],
    mutationFn: async (payload: any) =>
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

  const handleSubmit = () => {
    if (Object.keys(selectedOptions).length !== questions?.length) {
      toast.error("Please answer all the questions.");
      return;
    }
    const payload = Object.entries(selectedOptions).map(
      ([questionId, optionId]) => ({
        question_id: Number(questionId),
        selected_option_id: Number(optionId),
      }),
    );
    submitQuestionnairetMutation.mutate(payload);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="bg-gray-100 w-full max-w-2xl rounded-md bg-gray p-8 shadow-lg">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error occurred</div>
        ) : (
          <>
            <h1 className="mb-4 text-center text-2xl font-bold">
              Candidate Questionnaire
            </h1>
            {questions?.map((question: any) => (
              <div key={question.id} className="mb-4">
                <p className="mb-2 font-bold">{question.question}</p>
                {question.options.map((option: any) => (
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
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={submitQuestionnairetMutation.isPending}
              className="py-2"
            >
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};