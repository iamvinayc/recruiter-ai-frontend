import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    }).then(response => {
      setQuestions(response.data.data);
    });
  }, [candidate]);

  const handleCheckboxChange = (questionId: number, optionId: number) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    const payload = Object.entries(selectedOptions).map(([questionId, optionId]) => ({
      question_id: Number(questionId),
      selected_option_id: Number(optionId)
    }));

    axiosApi({
      url: "onboarding/questionnaire_submit/",
      method: "POST",
      params: { candidate },
      data: payload
    }).then(response => {
      console.log(response.data);
    });
  };

  return (
    <div className="p-4">
      {questions.map((question: any) => (
        <div key={question.id} className="mb-4">
          <p className="font-bold mb-2">{question.question}</p>
          {question.options.map((option: any) => (
            <div key={option.id} className="mb-1">
              <input
                type="checkbox"
                checked={selectedOptions[question.id] === option.id}
                onChange={() => handleCheckboxChange(question.id, option.id)}
                className="mr-2"
              />
              <label>{option.option}</label>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white">Submit</button>
    </div>
  );
};

