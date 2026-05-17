// ================================
// Ready-made quizzes
// Each quiz has 5 questions and 4 options per question
// ================================
const readyMadeQuizzes = {
  generalKnowledge: {
    title: "General Knowledge",
    questions: [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Rome"],
        answer: 2,
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Venus", "Jupiter"],
        answer: 1,
      },
      {
        question: "Which animal is the fastest land animal?",
        options: ["Elephant", "Lion", "Cheetah", "Horse"],
        answer: 2,
      },
      {
        question: "What is the currency of Japan?",
        options: ["Yen", "Dollar", "Euro", "Peso"],
        answer: 0,
      },
      {
        question: "Which ocean is the largest?",
        options: ["Atlantic", "Indian", "Pacific", "Arctic"],
        answer: 2,
      },
    ],
  },

  aiBasics: {
    title: "AI Basics",
    questions: [
      {
        question: "What does AI stand for?",
        options: ["Advanced Input", "Artificial Intelligence", "Auto Interface", "Action Internet"],
        answer: 1,
      },
      {
        question: "Which one is a common use of AI?",
        options: ["Washing clothes", "Making coffee by hand", "Voice assistants", "Painting a wall"],
        answer: 2,
      },
      {
        question: "Machine Learning is a part of:",
        options: ["Music", "AI", "Sports", "Cooking"],
        answer: 1,
      },
      {
        question: "Which of these can AI help with?",
        options: ["Recommendation systems", "Time travel", "Teleportation", "Making the sun shine"],
        answer: 0,
      },
      {
        question: "AI systems often learn from:",
        options: ["Data", "Sand", "Rain", "Paper only"],
        answer: 0,
      },
    ],
  },

  scienceFun: {
    title: "Science Fun",
    questions: [
      {
        question: "How many legs does a spider have?",
        options: ["6", "8", "10", "12"],
        answer: 1,
      },
      {
        question: "What gas do plants absorb from the air?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"],
        answer: 2,
      },
      {
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Mercury", "Earth", "Mars"],
        answer: 1,
      },
      {
        question: "What is H2O commonly known as?",
        options: ["Salt", "Water", "Sugar", "Air"],
        answer: 1,
      },
      {
        question: "Which part of the body helps us think?",
        options: ["Heart", "Lungs", "Brain", "Stomach"],
        answer: 2,
      },
    ],
  },
};

// ================================
// App state
// ================================
const appState = {
  currentQuizTitle: "",
  currentQuestions: [],
  currentIndex: 0,
  score: 0,
  answerLocked: false,
};

// Timer settings for each question
const DEFAULT_QUESTION_TIME = 10;
const AUTO_NEXT_DELAY = 1200;

let questionTimerInterval = null;
let nextQuestionTimeout = null;
let timeLeft = DEFAULT_QUESTION_TIME;
let currentQuestionTime = DEFAULT_QUESTION_TIME;

// Custom quiz builder state
const customQuiz = {
  title: "",
  questions: [],
};

// ================================
// DOM elements
// ================================
const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const quizTitleEl = document.getElementById("quizTitle");
const questionCounterEl = document.getElementById("questionCounter");
const scoreCounterEl = document.getElementById("scoreCounter");
const timerTextEl = document.getElementById("timerText");
const timerFillEl = document.getElementById("timerFill");
const progressTextEl = document.getElementById("progressText");
const progressFillEl = document.getElementById("progressFill");
const questionTextEl = document.getElementById("questionText");
const answerButtonsEl = document.getElementById("answerButtons");
const feedbackTextEl = document.getElementById("feedbackText");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

const resultTextEl = document.getElementById("resultText");
const resultPercentEl = document.getElementById("resultPercent");
const resultMessageEl = document.getElementById("resultMessage");
const playAgainBtn = document.getElementById("playAgainBtn");
const resultHomeBtn = document.getElementById("resultHomeBtn");

const customQuizTitleInput = document.getElementById("customQuizTitle");
const questionInput = document.getElementById("questionInput");
const option1Input = document.getElementById("option1Input");
const option2Input = document.getElementById("option2Input");
const option3Input = document.getElementById("option3Input");
const option4Input = document.getElementById("option4Input");
const correctAnswerInput = document.getElementById("correctAnswerInput");
const questionTimeInput = document.getElementById("questionTimeInput");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const startCustomQuizBtn = document.getElementById("startCustomQuizBtn");
const clearCustomQuizBtn = document.getElementById("clearCustomQuizBtn");
const creatorMessageEl = document.getElementById("creatorMessage");
const customCountEl = document.getElementById("customCount");
const customPreviewList = document.getElementById("customPreviewList");

// ================================
// Helper functions
// ================================
function showScreen(screenName) {
  // Hide all screens first
  startScreen.classList.remove("active");
  quizScreen.classList.remove("active");
  resultScreen.classList.remove("active");

  // Show the selected screen
  if (screenName === "start") startScreen.classList.add("active");
  if (screenName === "quiz") quizScreen.classList.add("active");
  if (screenName === "result") resultScreen.classList.add("active");
}

function setMessage(text, type = "info") {
  creatorMessageEl.textContent = text;
  creatorMessageEl.style.color =
    type === "success" ? "#86efac" :
    type === "error" ? "#fca5a5" :
    "#c7d2fe";
}

function resetQuizState() {
  appState.currentIndex = 0;
  appState.score = 0;
  appState.answerLocked = false;
}

function clearQuestionTimers() {
  if (questionTimerInterval) {
    clearInterval(questionTimerInterval);
    questionTimerInterval = null;
  }

  if (nextQuestionTimeout) {
    clearTimeout(nextQuestionTimeout);
    nextQuestionTimeout = null;
  }
}

function updateTimerDisplay() {
  const percent = Math.max(0, Math.round((timeLeft / currentQuestionTime) * 100));
  timerTextEl.textContent = `${timeLeft}s`;
  timerFillEl.style.width = `${percent}%`;
  timerFillEl.parentElement.setAttribute("aria-valuenow", String(percent));
}

function startQuestionTimer() {
  clearQuestionTimers();
  timeLeft = currentQuestionTime;
  updateTimerDisplay();

  questionTimerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearQuestionTimers();
      handleTimeUp();
    }
  }, 1000);
}

function scheduleNextQuestion() {
  clearQuestionTimers();
  nextQuestionTimeout = setTimeout(() => {
    nextQuestion();
  }, AUTO_NEXT_DELAY);
}

function updateProgress() {
  const totalQuestions = appState.currentQuestions.length || 1;
  const completedQuestions = Math.min(appState.currentIndex, totalQuestions);
  const progressPercent = Math.round((completedQuestions / totalQuestions) * 100);

  progressTextEl.textContent = `${progressPercent}%`;
  progressFillEl.style.width = `${progressPercent}%`;
  progressFillEl.parentElement.setAttribute("aria-valuenow", String(progressPercent));
}

function startQuiz(title, questions) {
  if (!questions || questions.length === 0) {
    setMessage("This quiz has no questions yet.", "error");
    return;
  }

  clearQuestionTimers();
  appState.currentQuizTitle = title;
  appState.currentQuestions = questions;
  resetQuizState();

  quizTitleEl.textContent = title;
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const currentQuestion = appState.currentQuestions[appState.currentIndex];

  // If there are no more questions, show the result screen
  if (!currentQuestion) {
    showResult();
    return;
  }

  questionCounterEl.textContent = `Question ${appState.currentIndex + 1} of ${appState.currentQuestions.length}`;
  scoreCounterEl.textContent = `Score: ${appState.score}`;
  questionTextEl.textContent = currentQuestion.question;
  feedbackTextEl.textContent = "";
  feedbackTextEl.className = "feedback";
  nextBtn.disabled = true;
  nextBtn.textContent = "Auto Next";
  appState.answerLocked = false;
  currentQuestionTime = Number(currentQuestion.timeLimit) || DEFAULT_QUESTION_TIME;
  timeLeft = currentQuestionTime;
  timerTextEl.textContent = `${currentQuestionTime}s`;
  updateProgress();
  startQuestionTimer();

  // Clear old answer buttons
  answerButtonsEl.innerHTML = "";

  // Create answer buttons
  currentQuestion.options.forEach((optionText, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.textContent = optionText;

    button.addEventListener("click", () => handleAnswer(index));
    answerButtonsEl.appendChild(button);
  });
}

function handleAnswer(selectedIndex) {
  if (appState.answerLocked) return;

  appState.answerLocked = true;
  clearQuestionTimers();

  const currentQuestion = appState.currentQuestions[appState.currentIndex];
  const buttons = Array.from(answerButtonsEl.querySelectorAll(".answer-btn"));
  const correctIndex = currentQuestion.answer;

  // Disable all buttons after one answer
  buttons.forEach((button) => {
    button.disabled = true;
  });

  // Mark the correct answer
  if (buttons[correctIndex]) {
    buttons[correctIndex].classList.add("correct");
    buttons[correctIndex].classList.add("reveal-correct");
  }

  // Check if the selected answer is right or wrong
  if (selectedIndex === correctIndex) {
    appState.score++;
    feedbackTextEl.textContent = "Correct! Nice job.";
    feedbackTextEl.className = "feedback correct";
    buttons[selectedIndex].classList.add("correct");
  } else {
    feedbackTextEl.textContent = `Wrong! The correct answer is: ${currentQuestion.options[correctIndex]}`;
    feedbackTextEl.className = "feedback wrong";
    buttons[selectedIndex].classList.add("wrong");
  }

  scoreCounterEl.textContent = `Score: ${appState.score}`;
  feedbackTextEl.textContent += " Moving to the next question...";
  scheduleNextQuestion();
}

function handleTimeUp() {
  if (appState.answerLocked) return;

  appState.answerLocked = true;

  const currentQuestion = appState.currentQuestions[appState.currentIndex];
  const buttons = Array.from(answerButtonsEl.querySelectorAll(".answer-btn"));
  const correctIndex = currentQuestion.answer;

  buttons.forEach((button) => {
    button.disabled = true;
  });

  if (buttons[correctIndex]) {
    buttons[correctIndex].classList.add("correct");
    buttons[correctIndex].classList.add("reveal-correct");
  }

  feedbackTextEl.textContent = `Time's up! The correct answer is: ${currentQuestion.options[correctIndex]}`;
  feedbackTextEl.className = "feedback wrong";
  nextBtn.disabled = true;
  nextBtn.textContent = "Auto Next";
  scheduleNextQuestion();
}

function nextQuestion() {
  clearQuestionTimers();
  appState.currentIndex++;
  renderQuestion();
}

function showResult() {
  clearQuestionTimers();
  showScreen("result");

  const total = appState.currentQuestions.length;
  resultTextEl.textContent = `You scored ${appState.score} out of ${total}.`;

  let message = "";
  const percent = (appState.score / total) * 100;
  resultPercentEl.textContent = `${Math.round(percent)}%`;

  if (percent === 100) {
    message = "Excellent! You got every question correct.";
    resultMessageEl.className = "result-message good";
  } else if (percent >= 80) {
    message = "Great work! You did really well.";
    resultMessageEl.className = "result-message good";
  } else if (percent >= 50) {
    message = "Good job! With a little more practice, you can improve even more.";
    resultMessageEl.className = "result-message ok";
  } else {
    message = "Keep practicing. You are learning step by step.";
    resultMessageEl.className = "result-message needs-work";
  }

  resultMessageEl.textContent = message;
}

function restartCurrentQuiz() {
  clearQuestionTimers();
  startQuiz(appState.currentQuizTitle, appState.currentQuestions);
}

function goHome() {
  clearQuestionTimers();
  showScreen("start");
  progressTextEl.textContent = "0%";
  progressFillEl.style.width = "0%";
  progressFillEl.parentElement.setAttribute("aria-valuenow", "0");
  timerTextEl.textContent = `${DEFAULT_QUESTION_TIME}s`;
  timerFillEl.style.width = "100%";
  timerFillEl.parentElement.setAttribute("aria-valuenow", "100");
}

// ================================
// Custom quiz builder
// ================================
function renderCustomPreview() {
  if (customQuiz.questions.length === 0) {
    customCountEl.textContent = "No questions added yet.";
    customPreviewList.innerHTML = "";
    return;
  }

  customCountEl.textContent = `${customQuiz.questions.length} question(s) added.`;

  customPreviewList.innerHTML = "";
  customQuiz.questions.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${item.question} (Correct: ${item.options[item.answer]}, Time: ${item.timeLimit || DEFAULT_QUESTION_TIME}s)`;
    customPreviewList.appendChild(li);
  });
}

function addCustomQuestion() {
  const title = customQuizTitleInput.value.trim();
  const question = questionInput.value.trim();
  const option1 = option1Input.value.trim();
  const option2 = option2Input.value.trim();
  const option3 = option3Input.value.trim();
  const option4 = option4Input.value.trim();
  const correctAnswer = Number(correctAnswerInput.value);
  const questionTime = Number(questionTimeInput.value);

  // Save title if user typed one
  if (title) {
    customQuiz.title = title;
  }

  // Validation
  if (!question || !option1 || !option2 || !option3 || !option4) {
    setMessage("Please fill in the question and all 4 options.", "error");
    return;
  }

  if (!Number.isFinite(questionTime) || questionTime < 5 || questionTime > 60) {
    setMessage("Please enter a time limit between 5 and 60 seconds.", "error");
    return;
  }

  customQuiz.questions.push({
    question,
    options: [option1, option2, option3, option4],
    answer: correctAnswer,
    timeLimit: questionTime,
  });

  // Clear only the question and options after adding
  questionInput.value = "";
  option1Input.value = "";
  option2Input.value = "";
  option3Input.value = "";
  option4Input.value = "";
  correctAnswerInput.value = "0";
  questionTimeInput.value = "10";

  setMessage("Question added successfully!", "success");
  renderCustomPreview();
}

function startCustomQuiz() {
  const title = customQuizTitleInput.value.trim() || customQuiz.title || "My Custom Quiz";

  if (customQuiz.questions.length === 0) {
    setMessage("Add at least one question before starting the custom quiz.", "error");
    return;
  }

  startQuiz(title, customQuiz.questions);
}

function clearCustomQuiz() {
  customQuiz.title = "";
  customQuiz.questions = [];
  customQuizTitleInput.value = "";
  questionInput.value = "";
  option1Input.value = "";
  option2Input.value = "";
  option3Input.value = "";
  option4Input.value = "";
  correctAnswerInput.value = "0";
  setMessage("Custom quiz cleared.", "info");
  renderCustomPreview();
}

// ================================
// Event listeners
// ================================

// Ready-made quiz cards
document.querySelectorAll(".quiz-card").forEach((card) => {
  card.addEventListener("click", () => {
    const quizKey = card.dataset.quiz;
    const selectedQuiz = readyMadeQuizzes[quizKey];
    startQuiz(selectedQuiz.title, selectedQuiz.questions);
  });
});

// Quiz controls
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartCurrentQuiz);
homeBtn.addEventListener("click", goHome);
playAgainBtn.addEventListener("click", restartCurrentQuiz);
resultHomeBtn.addEventListener("click", goHome);

// Custom quiz controls
addQuestionBtn.addEventListener("click", addCustomQuestion);
startCustomQuizBtn.addEventListener("click", startCustomQuiz);
clearCustomQuizBtn.addEventListener("click", clearCustomQuiz);

// Initial render
renderCustomPreview();
showScreen("start");
progressTextEl.textContent = "0%";
progressFillEl.style.width = "0%";
progressFillEl.parentElement.setAttribute("aria-valuenow", "0");
timerTextEl.textContent = `${DEFAULT_QUESTION_TIME}s`;
timerFillEl.style.width = "100%";
timerFillEl.parentElement.setAttribute("aria-valuenow", "100");