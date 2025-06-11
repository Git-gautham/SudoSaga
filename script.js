const gridEl = document.getElementById("grid");
const msgEl = document.getElementById("statusMsg");
let currentBoard = [];
let solvedBoard = [];
let clock = 0;
let clockTimer = null;

function initGame() {
  currentBoard = Array.from({ length: 9 }, () => Array(9).fill(""));
  solvedBoard = generateCompletePuzzle();
  maskCells(solvedBoard);
  renderGrid();
  launchTimer();
}

function startNewPuzzle() {
  if (!confirm("Start a new game? Progress will be lost.")) return;
  initGame();
  msgEl.textContent = "";
}

function renderGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = currentBoard[r][c];
      const box = document.createElement("div");
      box.className = "cell";
      if (value !== "") {
        box.classList.add("locked");
        box.textContent = value;
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.addEventListener("input", handleInput);
        box.appendChild(input);
      }
      gridEl.appendChild(box);
    }
  }
}

function handleInput(e) {
  const el = e.target;
  el.classList.remove("invalid");
  const v = el.value;
  if (!/^[1-9]?$/.test(v)) el.value = "";
}

function validateGrid() {
  const inputs = document.querySelectorAll(".cell input");
  let allCorrect = true;
  inputs.forEach(input => input.classList.remove("invalid"));

  for (let input of inputs) {
    const r = +input.dataset.row;
    const c = +input.dataset.col;
    if (input.value != solvedBoard[r][c]) {
      input.classList.add("invalid");
      allCorrect = false;
    }
  }

  msgEl.textContent = allCorrect ? "✅ Puzzle solved correctly!" : "❌ Something's off!";
  msgEl.style.color = allCorrect ? "green" : "red";

  if (allCorrect) {
    stopTimer();
    saveProgress();
  }
}

function clearInputs() {
  if (!confirm("Clear all your inputs?")) return;
  const inputs = document.querySelectorAll(".cell input");
  inputs.forEach(input => {
    input.value = "";
    input.classList.remove("invalid");
  });
  msgEl.textContent = "";
}

function generateCompletePuzzle() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(grid);
  return grid;
}

function fillBoard(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const choices = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let val of choices) {
          if (isSafe(grid, r, c, val)) {
            grid[r][c] = val;
            if (fillBoard(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isSafe(grid, r, c, num) {
  for (let i = 0; i < 9; i++)
    if (grid[r][i] === num || grid[i][c] === num) return false;

  const startRow = Math.floor(r / 3) * 3;
  const startCol = Math.floor(c / 3) * 3;

  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (grid[startRow + i][startCol + j] === num) return false;

  return true;
}

function maskCells(fullBoard) {
  currentBoard = fullBoard.map(row => [...row]);
  let blanks = 40;
  while (blanks > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (currentBoard[r][c] !== "") {
      currentBoard[r][c] = "";
      blanks--;
    }
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function launchTimer() {
  clearInterval(clockTimer);
  clock = 0;
  updateClock();
  clockTimer = setInterval(() => {
    clock++;
    updateClock();
  }, 1000);
}

function stopTimer() {
  clearInterval(clockTimer);
}

function updateClock() {
  document.getElementById("elapsedTime").innerText = `⏱️ Time: ${clock}s`;
}

function saveProgress() {
  const data = JSON.parse(localStorage.getItem("sudoSagaData") || "{}");
  data.solved = (data.solved || 0) + 1;
  data.total = (data.total || 0) + clock;
  data.best = data.best ? Math.min(data.best, clock) : clock;

  data.top = data.top || [];
  data.top.push(clock);
  data.top.sort((a, b) => a - b);
  data.top = data.top.slice(0, 5);

  localStorage.setItem("sudoSagaData", JSON.stringify(data));
  showProgress();
}

function resetProgress() {
  if (!confirm("This will clear all your stats and times.")) return;
  localStorage.removeItem("sudoSagaData");
  showProgress();
}

function showProgress() {
  const d = JSON.parse(localStorage.getItem("sudoSagaData") || "{}");
  document.getElementById("summary").innerText =
    `🎯 Solved: ${d.solved || 0} | 🏁 Fastest: ${d.best || "-"}s | ⌛ Total: ${d.total || 0}s`;

  const list = document.getElementById("topTimes");
  list.innerHTML = "";
  (d.top || []).forEach(t => {
    const item = document.createElement("li");
    item.innerText = `${t}s`;
    list.appendChild(item);
  });
}

function fillOneHint() {
  const inputs = document.querySelectorAll(".cell input");
  for (let input of inputs) {
    const r = +input.dataset.row;
    const c = +input.dataset.col;
    if (input.value === "") {
      input.value = solvedBoard[r][c];
      break;
    }
  }
}

function switchTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function loadTheme() {
  const mode = localStorage.getItem("theme");
  if (mode === "dark") document.body.classList.add("dark");
}

window.onload = () => {
  loadTheme();
  showProgress();
  initGame();
};
