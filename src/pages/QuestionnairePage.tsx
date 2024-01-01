import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom';


import { axiosApi } from '../api/api';
import { ROUTES } from '@/routes/routes';
export const QuestionnairePage: React.FC = () => {
  const [questions, setQuestions] = useState<any>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number }>({});
  const navigate = useNavigate();
  const [{ candidate }] = useTypedSearchParams(
    ROUTES.QUESTIONNAIRE,
  );

  useEffect(() => {
    if (!candidate) {
      navigate('/');
      return;
    }

    axiosApi({
      url: "onboarding/questionnaire/",
      method: "GET",
      params: { candidate }
    }).then((e) => {
      if (e.data.isSuccess) {
        setQuestions(e.data.data);
      } else {
        throw new Error(e.data.message);
      }
    }).catch(error => {
      toast.error(error.message);
      navigate('/');
    });
  }, [candidate]);

  const handleCheckboxChange = (questionId: number, optionId: number) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(selectedOptions).length !== questions.length) {
      toast.error('Please answer all the questions.');
      return;
    }

    const payload = Object.entries(selectedOptions).map(([questionId, optionId]) => ({
      question_id: Number(questionId),
      selected_option_id: Number(optionId)
    }));

    axiosApi({
      url: "onboarding/questionnaire_submit/",
      method: "POST",
      params: { candidate },
      data: payload
    }).then((response) => {
      if (response.data.isSuccess) {
        toast.success('Questionnaire Submitted Successfully!');
        navigate('/');
      } else {
        throw new Error(response.data.message);
      }
    }).catch(error => {
      toast.error(error.message);
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-100">
      <div className="p-8 bg-gray-100 shadow-lg rounded-md w-full max-w-2xl bg-gray">
        <h1 className="text-2xl font-bold mb-4 text-center">Candidate Questionnaire</h1>
        {questions.map((question: any) => (
          <div key={question.id} className="mb-4">
            <p className="font-bold mb-2">{question.question}</p>
            {question.options.map((option: any) => (
              <div key={option.id} className="mb-1 flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={selectedOptions[question.id] === option.id}
                  onChange={() => handleCheckboxChange(question.id, option.id)}
                  className="mr-2"
                />
                <label>{option.option}</label>
              </div>
            ))}
          </div>
        ))}
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded w-full">Submit</button>
      </div>
    </div>
  );
};