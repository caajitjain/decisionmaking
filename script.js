document.addEventListener("DOMContentLoaded", function () {
  // Application state
  const state = {
    decisionQuestion: "",
    options: [],
    criteria: [],
    evaluations: [], // Will be a 2D array: options x criteria
    results: {
      scores: [],
      topOptionIndex: -1,
    },
  };

  // DOM Elements
  const screens = document.querySelectorAll(".screen");
  const startBtn = document.getElementById("start-btn");
  const decisionQuestionInput = document.getElementById("decision-question");
  const optionsContainer = document.getElementById("options-container");
  const addOptionBtn = document.getElementById("add-option-btn");
  const toCriteriaBtn = document.getElementById("to-criteria-btn");
  const criteriaContainer = document.getElementById("criteria-container");
  const addCriteriaBtn = document.getElementById("add-criteria-btn");
  const toEvaluationBtn = document.getElementById("to-evaluation-btn");
  const evaluationMatrix = document.getElementById("evaluation-matrix");
  const calculateBtn = document.getElementById("calculate-btn");
  const scoresVisual = document.getElementById("scores-visual");
  const topOptionDisplay = document.getElementById("top-option-display");
  const analysisBreakdown = document.getElementById("analysis-breakdown");
  const aiAdvice = document.getElementById("ai-advice");
  const restartBtn = document.getElementById("restart-btn");
  const exportBtn = document.getElementById("export-btn");
  const backBtns = document.querySelectorAll(".back-btn");

  // Navigation functions
  function showScreen(screenId) {
    screens.forEach((screen) => {
      screen.classList.remove("active");
    });
    document.getElementById(screenId).classList.add("active");
  }

  // Initialize event listeners
  function initEventListeners() {
    // Start button
    startBtn.addEventListener("click", () => {
      if (validateWelcomeScreen()) {
        showScreen("options-screen");
      }
    });

    // Add option button
    addOptionBtn.addEventListener("click", addOptionInput);

    // Remove option buttons
    optionsContainer.addEventListener("click", (e) => {
      if (e.target.closest(".remove-option-btn")) {
        e.target.closest(".option-input").remove();
      }
    });

    // To criteria button
    toCriteriaBtn.addEventListener("click", () => {
      if (validateOptionsScreen()) {
        showScreen("criteria-screen");
      }
    });

    // Add criteria button
    addCriteriaBtn.addEventListener("click", addCriteriaInput);

    // Remove criteria buttons
    criteriaContainer.addEventListener("click", (e) => {
      if (e.target.closest(".remove-criteria-btn")) {
        e.target.closest(".criteria-input").remove();
      }
    });

    // To evaluation button
    toEvaluationBtn.addEventListener("click", () => {
      if (validateCriteriaScreen()) {
        buildEvaluationMatrix();
        showScreen("evaluation-screen");
      }
    });

    // Calculate button
    calculateBtn.addEventListener("click", () => {
      if (validateEvaluationScreen()) {
        calculateResults();
        showResults();
        showScreen("results-screen");
      }
    });

    // Restart button
    restartBtn.addEventListener("click", () => {
      resetApplication();
      showScreen("welcome-screen");
    });

    // Export button
    exportBtn.addEventListener("click", exportAnalysis);

    // Back buttons
    backBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const currentScreen = document.querySelector(".screen.active");
        const screenId = currentScreen.id;

        if (screenId === "options-screen") {
          showScreen("welcome-screen");
        } else if (screenId === "criteria-screen") {
          showScreen("options-screen");
        } else if (screenId === "evaluation-screen") {
          showScreen("criteria-screen");
        } else if (screenId === "results-screen") {
          showScreen("evaluation-screen");
        }
      });
    });
  }

  // Validation functions
  function validateWelcomeScreen() {
    if (!decisionQuestionInput.value.trim()) {
      alert("Please enter a decision question to proceed.");
      return false;
    }

    state.decisionQuestion = decisionQuestionInput.value.trim();
    return true;
  }

  function validateOptionsScreen() {
    const optionInputs = document.querySelectorAll(".option-field");
    state.options = [];

    // Check if at least two options exist
    if (optionInputs.length < 2) {
      alert("Please add at least two options to compare.");
      return false;
    }

    // Check if all options have values
    let allValid = true;
    optionInputs.forEach((input) => {
      if (!input.value.trim()) {
        allValid = false;
        input.style.borderColor = "red";
      } else {
        state.options.push(input.value.trim());
        input.style.borderColor = "";
      }
    });

    if (!allValid) {
      alert("Please fill in all option fields.");
      return false;
    }

    return true;
  }

  function validateCriteriaScreen() {
    const criteriaInputs = document.querySelectorAll(".criteria-input");
    state.criteria = [];

    // Check if at least one criterion exists
    if (criteriaInputs.length < 1) {
      alert("Please add at least one criterion to evaluate your options.");
      return false;
    }

    // Check if all criteria have values
    let allValid = true;
    criteriaInputs.forEach((criteriaDiv) => {
      const criteriaField = criteriaDiv.querySelector(".criteria-field");
      const criteriaWeight = criteriaDiv.querySelector(".criteria-weight");

      if (!criteriaField.value.trim()) {
        allValid = false;
        criteriaField.style.borderColor = "red";
      } else {
        state.criteria.push({
          name: criteriaField.value.trim(),
          weight: parseInt(criteriaWeight.value),
        });
        criteriaField.style.borderColor = "";
      }
    });

    if (!allValid) {
      alert("Please fill in all criteria fields.");
      return false;
    }

    return true;
  }

  function validateEvaluationScreen() {
    const allRatings = document.querySelectorAll(".rating-select");
    let allValid = true;

    allRatings.forEach((rating) => {
      if (rating.value === "") {
        allValid = false;
        rating.style.borderColor = "red";
      } else {
        rating.style.borderColor = "";
      }
    });

    if (!allValid) {
      alert("Please rate all options against all criteria.");
      return false;
    }

    // Save evaluations
    state.evaluations = [];
    for (let i = 0; i < state.options.length; i++) {
      const optionRatings = [];
      for (let j = 0; j < state.criteria.length; j++) {
        const select = document.getElementById(`rating-${i}-${j}`);
        optionRatings.push(parseInt(select.value));
      }
      state.evaluations.push(optionRatings);
    }

    return true;
  }

  // UI Building functions
  function addOptionInput() {
    const optionCount = document.querySelectorAll(".option-input").length;
    const newOption = document.createElement("div");
    newOption.className = "option-input";
    newOption.innerHTML = `
            <input type="text" class="option-field" placeholder="Option ${
              optionCount + 1
            }">
            <button class="remove-option-btn"><i class="fas fa-times"></i></button>
        `;
    optionsContainer.appendChild(newOption);
  }

  function addCriteriaInput() {
    const criteriaCount = document.querySelectorAll(".criteria-input").length;
    const newCriteria = document.createElement("div");
    newCriteria.className = "criteria-input";
    newCriteria.innerHTML = `
            <input type="text" class="criteria-field" placeholder="Criteria ${
              criteriaCount + 1
            }">
            <select class="criteria-weight">
                <option value="1">Low Importance</option>
                <option value="2" selected>Medium Importance</option>
                <option value="3">High Importance</option>
            </select>
            <button class="remove-criteria-btn"><i class="fas fa-times"></i></button>
        `;
    criteriaContainer.appendChild(newCriteria);
  }

  function buildEvaluationMatrix() {
    let tableHTML = `
            <table class="evaluation-table">
                <thead>
                    <tr>
                        <th>Criteria ↓ / Options →</th>
        `;

    // Add column headers for each option
    state.options.forEach((option) => {
      tableHTML += `<th>${option}</th>`;
    });

    tableHTML += `
                    </tr>
                </thead>
                <tbody>
        `;

    // Add rows for each criterion
    state.criteria.forEach((criterion, criterionIndex) => {
      tableHTML += `
                <tr>
                    <td>${criterion.name} (${getWeightLabel(
        criterion.weight
      )})</td>
            `;

      // Add rating dropdown for each option
      state.options.forEach((option, optionIndex) => {
        tableHTML += `
                    <td>
                        <select id="rating-${optionIndex}-${criterionIndex}" class="rating-select">
                            <option value="">Select...</option>
                            <option value="1">Poor (1)</option>
                            <option value="2">Fair (2)</option>
                            <option value="3">Good (3)</option>
                            <option value="4">Very Good (4)</option>
                            <option value="5">Excellent (5)</option>
                        </select>
                    </td>
                `;
      });

      tableHTML += `</tr>`;
    });

    tableHTML += `
                </tbody>
            </table>
        `;

    evaluationMatrix.innerHTML = tableHTML;
  }

  function getWeightLabel(weight) {
    if (weight === 1) return "Low Importance";
    if (weight === 2) return "Medium Importance";
    if (weight === 3) return "High Importance";
    return "Unknown";
  }

  // Calculation functions
  function calculateResults() {
    // Calculate weighted scores for each option
    const scores = [];

    for (let i = 0; i < state.options.length; i++) {
      let totalScore = 0;
      let totalWeight = 0;

      for (let j = 0; j < state.criteria.length; j++) {
        const rating = state.evaluations[i][j];
        const weight = state.criteria[j].weight;

        totalScore += rating * weight;
        totalWeight += weight;
      }

      // Calculate weighted average (out of 100)
      const weightedScore = (totalScore / (totalWeight * 5)) * 100;
      scores.push({
        option: state.options[i],
        score: weightedScore,
      });
    }

    // Sort scores in descending order
    scores.sort((a, b) => b.score - a.score);

    // Find index of top option in original array
    const topOptionIndex = state.options.indexOf(scores[0].option);

    // Save results
    state.results.scores = scores;
    state.results.topOptionIndex = topOptionIndex;
  }

  function showResults() {
    // Display scores as bar chart
    let barChartHTML = '<div class="bar-chart">';

    state.results.scores.forEach((item) => {
      barChartHTML += `
                <div class="bar-item">
                    <div class="bar-label">${item.option}</div>
                    <div class="bar-container">
                        <div class="bar" style="width: ${
                          item.score
                        }%">${Math.round(item.score)}%</div>
                    </div>
                    <div class="bar-score">${Math.round(item.score)}/100</div>
                </div>
            `;
    });

    barChartHTML += "</div>";
    scoresVisual.innerHTML = barChartHTML;

    // Display top option
    const topOption = state.results.scores[0];
    topOptionDisplay.innerHTML = `
            <h3>Top Choice Based on Your Criteria:</h3>
            <p style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">
                ${topOption.option}
            </p>
            <p>Score: ${Math.round(topOption.score)}/100</p>
        `;

    // Generate analysis breakdown
    let breakdownHTML = `<h3>Why This Option Ranked Highest</h3><p>Here's how ${topOption.option} performed against your criteria:</p><ul>`;

    // Find the top 3 strengths of this option
    const topOptionIndex = state.options.indexOf(topOption.option);
    const strengths = [];

    for (let j = 0; j < state.criteria.length; j++) {
      strengths.push({
        criterion: state.criteria[j].name,
        weight: state.criteria[j].weight,
        rating: state.evaluations[topOptionIndex][j],
        weightedScore:
          state.evaluations[topOptionIndex][j] * state.criteria[j].weight,
      });
    }

    strengths.sort((a, b) => b.weightedScore - a.weightedScore);

    strengths.slice(0, 3).forEach((strength) => {
      breakdownHTML += `
                <li><strong>${strength.criterion}</strong>: Rated ${
        strength.rating
      }/5 
                (${getWeightLabel(strength.weight)})</li>
            `;
    });

    breakdownHTML += `</ul>`;
    analysisBreakdown.innerHTML = breakdownHTML;

    // Generate AI advice
    generateDecisionAdvice();
  }

  function generateDecisionAdvice() {
    const topOption = state.results.scores[0];
    const secondOption =
      state.results.scores.length > 1 ? state.results.scores[1] : null;
    const scoreDifference = secondOption
      ? topOption.score - secondOption.score
      : 0;

    let advice = "";

    // When the top option is significantly better (more than 15 points)
    if (scoreDifference > 15) {
      advice = `<p>Based on your inputs, <strong>${
        topOption.option
      }</strong> significantly outperforms the other options. 
            The score difference of ${Math.round(
              scoreDifference
            )} points suggests this choice is well-aligned with what matters to you.</p>
            <p>Consider taking action on this decision with confidence, but still reflect on any potential risks or considerations 
            that might not have been captured in your evaluation criteria.</p>`;
    }
    // When the top options are close (within 5 points)
    else if (secondOption && scoreDifference < 5) {
      advice = `<p>The scores for <strong>${
        topOption.option
      }</strong> and <strong>${secondOption.option}</strong> 
            are quite close (only ${Math.round(
              scoreDifference
            )} points apart).</p>
            <p>This suggests that both options could be viable. Consider if there are any additional factors not included in your 
            evaluation that might help differentiate between these choices. Sometimes a "gut check" can be valuable when analytical 
            methods show similar results.</p>`;
    }
    // When there's a moderate preference (5-15 points difference)
    else if (secondOption) {
      advice = `<p><strong>${
        topOption.option
      }</strong> appears to be a better fit based on your criteria, 
            with a ${Math.round(
              scoreDifference
            )} point lead over the next option.</p>
            <p>This indicates a clear preference, though not overwhelming. Consider if there are any key risks or downsides to 
            your top choice that might warrant further consideration before finalizing your decision.</p>`;
    }
    // When there's only one option (shouldn't normally happen)
    else {
      advice = `<p>With only one option evaluated, the decision seems straightforward. However, it's generally 
            beneficial to consider alternatives to ensure you're making the most informed choice.</p>`;
    }

    // Add general decision-making wisdom
    advice += `<p>Remember that this tool is designed to support your decision-making process, not replace it. 
        The best decisions often combine analytical thinking with intuition and personal values.</p>`;

    aiAdvice.innerHTML = advice;
  }

  function exportAnalysis() {
    // Create text content for export
    let exportContent = `DECISION ANALYSIS: ${state.decisionQuestion}\n`;
    exportContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    exportContent += `OPTIONS EVALUATED:\n`;
    state.options.forEach((option) => {
      exportContent += `- ${option}\n`;
    });

    exportContent += `\nEVALUATION CRITERIA:\n`;
    state.criteria.forEach((criterion) => {
      exportContent += `- ${criterion.name} (${getWeightLabel(
        criterion.weight
      )})\n`;
    });

    exportContent += `\nRESULTS (Higher is better):\n`;
    state.results.scores.forEach((item) => {
      exportContent += `- ${item.option}: ${Math.round(item.score)}/100\n`;
    });

    exportContent += `\nTOP CHOICE: ${state.results.scores[0].option}\n`;

    // Generate and trigger download
    const blob = new Blob([exportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decision-analysis.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function resetApplication() {
    // Reset state
    state.decisionQuestion = "";
    state.options = [];
    state.criteria = [];
    state.evaluations = [];
    state.results = {
      scores: [],
      topOptionIndex: -1,
    };

    // Reset UI elements
    decisionQuestionInput.value = "";

    // Reset options
    while (optionsContainer.children.length > 2) {
      optionsContainer.removeChild(optionsContainer.lastChild);
    }
    document.querySelectorAll(".option-field").forEach((field) => {
      field.value = "";
    });

    // Reset criteria
    while (criteriaContainer.children.length > 2) {
      criteriaContainer.removeChild(criteriaContainer.lastChild);
    }
    document.querySelectorAll(".criteria-field").forEach((field) => {
      field.value = "";
    });

    // Reset evaluation matrix
    evaluationMatrix.innerHTML = "";

    // Reset results
    scoresVisual.innerHTML = "";
    topOptionDisplay.innerHTML = "";
    analysisBreakdown.innerHTML = "";
    aiAdvice.innerHTML = "";
  }

  // Initialize the application
  initEventListeners();
});
