// Fisher–Yates shuffle
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Select balanced questions by difficulty
export const selectBalancedQuestions = (questions, total = 10) => {
    const easy = questions.filter((q) => q.difficulty === "easy");
    const medium = questions.filter((q) => q.difficulty === "medium");
    const hard = questions.filter((q) => q.difficulty === "hard");

    const easyCount = Math.floor(total / 3); // 3
    const mediumCount = Math.floor((total * 4) / 10); // 4
    const hardCount = total - easyCount - mediumCount; // 3

    const selected = [
        ...shuffleArray(easy).slice(0, easyCount),
        ...shuffleArray(medium).slice(0, mediumCount),
        ...shuffleArray(hard).slice(0, hardCount),
    ];

    return shuffleArray(selected); // shuffle final array
};