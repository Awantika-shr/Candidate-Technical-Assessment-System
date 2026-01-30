import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AssessmentPage from "./pages/AssesmentPage";


const App = () => {
  const [selectedLanguages, setSelectedLanguages] = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState(null);

  const startTest = (languages) => setSelectedLanguages(languages);

  const submitTest = (answers) => {
    setSubmittedAnswers(answers);
    console.log("Test submitted:", answers);
  };

  if (submittedAnswers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl text-center">
          Test submitted successfully! <br />
          Answers: {JSON.stringify(submittedAnswers)}
        </h1>
      </div>
    );
  }

  return !selectedLanguages ? (
    <LandingPage onStartTest={startTest} />
  ) : (
    <AssessmentPage
      selectedLanguages={selectedLanguages}
      onSubmitTest={submitTest}
    />
  );
}

export default App;