import React, { useState, useEffect } from "react";
import axios from "axios";
import { selectBalancedQuestions, shuffleArray } from "../../utils/shuffleAlgo";
import { questionsData } from "../questionData";

const TIME_PER_QUESTION = 30;
const SCORE_THRESHOLD = 6;

const AssessmentPage = ({ selectedLanguages }) => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState([]);
    const [skipped, setSkipped] = useState([]);
    const [notification, setNotification] = useState("");
    const [file, setFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");

    // Load and shuffle questions
    const loadQuestions = () => {
        const combined = selectedLanguages.flatMap((lang) => questionsData[lang] || []);
        const selected = selectBalancedQuestions(combined, 10).map((q) => {
            const originalOptions = [...q.options];
            const shuffledOptions = shuffleArray(originalOptions);
            const answerIndices = Array.isArray(q.answer) ? q.answer : [q.answer];
            const newAnswerIndices = answerIndices.map((ai) =>
                shuffledOptions.findIndex((opt) => opt === originalOptions[ai])
            );
            return { ...q, options: shuffledOptions, answer: newAnswerIndices };
        });

        setQuestions(selected);
        setCurrentIndex(0);
        setAnswers({});
        setTimeLeft(TIME_PER_QUESTION);
        setShowScore(false);
        setScore(0);
        setFeedback([]);
        setSkipped([]);
        setNotification("");
        setFile(null);
        setUploadMessage("");
    };

    useEffect(() => {
        loadQuestions();
    }, [selectedLanguages]);

    // Timer logic
    useEffect(() => {
        if (showScore) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAutoNext();
                    return TIME_PER_QUESTION;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentIndex, showScore, answers]);

    const handleSelectOption = (optionIndex) => {
        const currentAnswers = answers[currentIndex] || [];
        const updated = currentAnswers.includes(optionIndex)
            ? currentAnswers.filter((i) => i !== optionIndex)
            : [...currentAnswers, optionIndex];
        setAnswers({ ...answers, [currentIndex]: updated });
        if (updated.length > 0 && skipped.includes(currentIndex)) {
            setSkipped(skipped.filter((i) => i !== currentIndex));
        }
    };

    const handleAutoNext = () => {
        if (!answers[currentIndex] || answers[currentIndex].length === 0) {
            setSkipped([...skipped, currentIndex]);
            showTempNotification("⏰ Time's up! Question skipped");
        }
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setTimeLeft(TIME_PER_QUESTION);
        } else {
            handleSubmit();
        }
    };

    const showTempNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(""), 2000);
    };

    const handleNext = () => {
        if (!answers[currentIndex] || answers[currentIndex].length === 0) {
            setSkipped([...skipped, currentIndex]);
        }
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
        setTimeLeft(TIME_PER_QUESTION);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
        setTimeLeft(TIME_PER_QUESTION);
    };

    const handleSubmit = () => {
        let totalScore = 0;
        const feedbackData = questions.map((q, idx) => {
            const userAns = answers[idx] || [];
            const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
            const isFullyCorrect =
                userAns.length === correctAns.length &&
                userAns.every((a) => correctAns.includes(a));
            const isPartiallyCorrect =
                !isFullyCorrect && userAns.some((a) => correctAns.includes(a));

            if (isFullyCorrect) totalScore += 1;
            else if (isPartiallyCorrect) totalScore += 0.5;

            return {
                question: q.question,
                options: q.options,
                correctAnswers: correctAns.map((i) => q.options[i]),
                userAnswers: userAns.map((i) => q.options[i]),
                status: isFullyCorrect
                    ? "Correct"
                    : isPartiallyCorrect
                        ? "Partially Correct"
                        : "Wrong",
            };
        });

        setScore(totalScore);
        setFeedback(feedbackData);
        setShowScore(true);
    };

    // Resume upload
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) return setUploadMessage("Please select a file");

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
            return setUploadMessage("Only PDF/DOC/DOCX files are allowed");
        }

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await axios.post("http://localhost:5000/api/upload/upload-resume", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadMessage(res.data.message);
        } catch (err) {
            setUploadMessage(err.response?.data?.message || "Upload failed");
        }
    };

    if (!questions.length) return <div className="text-center py-10 text-gray-500">Loading...</div>;

    // --- Score Page ---
    if (showScore) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="bg-white shadow-md rounded-2xl p-6 sm:p-8">
                    <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
                        ✅ Test Completed!
                    </h2>
                    <p className="text-lg text-center mb-8 text-gray-600">
                        Your Score: <span className="font-semibold text-blue-600">{score}</span> / {questions.length}
                    </p>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {feedback.map((f, idx) => (
                            <div key={idx} className="border rounded-lg p-4 hover:shadow-sm transition">
                                <p className="font-semibold text-gray-800 mb-2">Q{idx + 1}: {f.question}</p>
                                <p className="text-sm text-gray-600">Your Answer: {f.userAnswers.join(", ") || "No Answer"}</p>
                                <p className="text-sm text-gray-600">Correct Answer: {f.correctAnswers.join(", ")}</p>
                                <p className="mt-1 text-sm">
                                    Status:{" "}
                                    <span className={
                                        f.status === "Correct"
                                            ? "text-green-600 font-medium"
                                            : f.status === "Partially Correct"
                                                ? "text-yellow-600 font-medium"
                                                : "text-red-600 font-medium"
                                    }>
                                        {f.status}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>

                    {skipped.length > 0 && (
                        <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                            <p className="font-semibold text-yellow-700">Skipped Questions: {skipped.map((i) => i + 1).join(", ")}</p>
                        </div>
                    )}

                    {score >= SCORE_THRESHOLD ? (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <p className="text-green-600 font-semibold mb-2 text-center">
                                🎉 Congratulations! You passed the test. Upload your resume:
                            </p>

                            <div className="flex items-center gap-3">
                                {/* Custom file upload */}
                                <label className="cursor-pointer px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M4 3a1 1 0 011-1h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3zM4 3v12h12V3H4zm6 3l3 3h-2v4h-2v-4H7l3-3z" />
                                    </svg>
                                    {file ? file.name : "Choose File"}
                                    <input type="file" onChange={handleFileChange} className="hidden" />
                                </label>

                                <button
                                    onClick={handleUpload}
                                    className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition flex items-center gap-1"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M3 10a7 7 0 1114 0H3z" />
                                    </svg>
                                    Upload
                                </button>
                            </div>
                            {uploadMessage && (
                                <p className="mt-2 text-center text-sm text-gray-600">{uploadMessage}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-red-600 text-center mt-6 text-lg font-semibold">Try again later 😔</p>
                    )}

                    {/* Restart Test Button as Rounded Icon */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={loadQuestions}
                            className="bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-lg transition flex items-center justify-center"
                            title="Restart Test"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 14a8 8 0 1116 0 8 8 0 01-16 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Question Page ---
    const currentQuestion = questions[currentIndex];
    const progressPercent = (timeLeft / TIME_PER_QUESTION) * 100;
    const isSkipped = skipped.includes(currentIndex);

    return (
        <div className="min-h-screen flex flex-col justify-center px-4 py-10 bg-gray-50">
            {notification && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-2 rounded-xl shadow-lg animate-pulse z-50">
                    {notification}
                </div>
            )}

            <div
                className={`bg-white shadow-md rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto w-full border-2 ${isSkipped ? "border-red-500" : "border-transparent"
                    }`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        Question {currentIndex + 1} of {questions.length}
                    </h2>
                    <p className="text-sm text-gray-500">{timeLeft}s</p>
                </div>

                <p className="text-gray-800 text-base sm:text-lg mb-6">{currentQuestion.question}</p>

                <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectOption(idx)}
                            className={`p-3 sm:p-4 rounded-lg border text-left transition-all duration-200
                ${answers[currentIndex]?.includes(idx)
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="h-2 bg-gray-200 rounded mt-6 overflow-hidden">
                    <div
                        className="h-2 bg-blue-600 transition-all"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {currentIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Submit
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;