import React, { useState } from "react";

const languages = ["JavaScript", "Python", "Java", "C++", "React", "Node.js"];

const LandingPage = ({ onStartTest }) => {
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const toggleLanguage = (lang) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang)
                ? prev.filter((l) => l !== lang)
                : [...prev, lang]
        );
    };

    const handleStartTest = () => {
        if (selectedLanguages.length === 0) {
            alert("Please select at least one language to start the test.");
            return;
        }
        onStartTest(selectedLanguages);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                        Choose Your Programming Languages
                    </h1>
                    <p className="text-gray-500 text-base sm:text-lg">
                        Select one or more languages to begin your assessment.
                    </p>
                </div>

                {/* Language Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => toggleLanguage(lang)}
                            className={`py-4 px-5 rounded-xl border text-sm sm:text-base font-medium transition-all duration-200
                ${selectedLanguages.includes(lang)
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                                    : "bg-white text-gray-800 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:shadow"
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>

                {/* Start Button */}
                <div className="text-center">
                    <button
                        onClick={handleStartTest}
                        className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-10 rounded-xl transition-colors shadow-md"
                    >
                        Start Test
                    </button>
                </div>
            </div>
        </div>
    );
};
export default LandingPage;