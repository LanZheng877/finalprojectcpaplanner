let currentCalendar = null;

const nycBackgrounds = [
  "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=80"
];

let backgroundIndex = 0;

setInterval(() => {
  backgroundIndex = (backgroundIndex + 1) % nycBackgrounds.length;
  document.body.style.backgroundImage = `url("${nycBackgrounds[backgroundIndex]}")`;
}, 8000);

const encouragements = [
  "You are closer than you think.",
  "Small progress every day adds up.",
  "Future CPA loading...",
  "Keep going, you are building your future.",
  "Discipline now, confidence later.",
  "You got this, girl.",
  "One module at a time.",
  "Go kill it girl."
];

let encouragementIndex = 0;

setInterval(() => {
  const textEl = document.getElementById("encouragementText");
  textEl.style.opacity = 0;

  setTimeout(() => {
    encouragementIndex = (encouragementIndex + 1) % encouragements.length;
    textEl.textContent = encouragements[encouragementIndex];
    textEl.style.opacity = 1;
  }, 400);
}, 8000);

function updateClock() {
  const now = new Date();

  const nyTime = now.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  document.getElementById("clock").textContent = nyTime;
}

setInterval(updateClock, 1000);
updateClock();

async function getWeather() {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,weather_code&temperature_unit=fahrenheit"
    );

    const data = await response.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;

    const weatherDescriptions = {
      0: "Clear",
      1: "Mostly Clear",
      2: "Partly Cloudy",
      3: "Cloudy",
      45: "Foggy",
      48: "Foggy",
      51: "Light Drizzle",
      61: "Rainy",
      63: "Rainy",
      65: "Heavy Rain",
      71: "Snowy",
      80: "Rain Showers",
      95: "Thunderstorm"
    };

    const description = weatherDescriptions[code] || "Weather";
    document.getElementById("weather").textContent = `${temp}°F, ${description}`;
  } catch (error) {
    document.getElementById("weather").textContent = "Weather unavailable";
  }
}

getWeather();

function generatePlan() {
  const title = document.getElementById("calendarTitle").value.trim();
  const examDate = document.getElementById("examDate").value;
  const modules = Number(document.getElementById("modules").value);
  const studyHours = Number(document.getElementById("studyHours").value);
  const practiceHours = Number(document.getElementById("practiceHours").value);

  const summaryOutput = document.getElementById("summaryOutput");
  const calendarOutput = document.getElementById("calendarOutput");

  if (!title || !examDate || modules <= 0 || studyHours <= 0 || practiceHours < 0) {
    summaryOutput.innerHTML = `<p class="error">Please fill out all fields correctly, including calendar title.</p>`;
    calendarOutput.innerHTML = "";
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const testDay = new Date(examDate);
  testDay.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((testDay - today) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 7) {
    summaryOutput.innerHTML = `<p class="error">Please choose an exam date more than 7 days away.</p>`;
    calendarOutput.innerHTML = "";
    return;
  }

  const practiceDays = 7;
  const contentDays = daysLeft - practiceDays;
  const contentHours = studyHours - practiceHours;

  if (contentHours <= 0) {
    summaryOutput.innerHTML = `<p class="error">Total study hours must be greater than practice exam hours.</p>`;
    calendarOutput.innerHTML = "";
    return;
  }

  const hoursPerModule = contentHours / modules;
  const dailyContentHours = contentHours / contentDays;
  const dailyPracticeHours = practiceHours / practiceDays;

  currentCalendar = {
    id: Date.now().toString(),
    title,
    examDate,
    modules,
    studyHours,
    practiceHours,
    daysLeft,
    contentDays,
    contentHours,
    hoursPerModule,
    dailyContentHours,
    dailyPracticeHours,
    checkedTasks: {}
  };

  renderCurrentCalendar();
}

function renderCurrentCalendar() {
  if (!currentCalendar) return;

  const summaryOutput = document.getElementById("summaryOutput");

  summaryOutput.innerHTML = `
    <p><strong>Calendar:</strong> ${currentCalendar.title}</p>
    <p><strong>Days until exam:</strong> ${currentCalendar.daysLeft}</p>
    <p><strong>Content study period:</strong> ${currentCalendar.contentDays} days</p>
    <p><strong>Final practice period:</strong> Last 7 days</p>
    <p><strong>Estimated time per module:</strong> ${currentCalendar.hoursPerModule.toFixed(1)} hours</p>
    <p><strong>Daily content study goal:</strong> ${currentCalendar.dailyContentHours.toFixed(1)} hours per day</p>
  `;

  createCalendar();
}

function createCalendar() {
  const calendarOutput = document.getElementById("calendarOutput");
  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  let calendarHTML = `<div class="calendar">`;
  calendarHTML += `<div class="calendar-header"></div>`;

  days.forEach(day => {
    calendarHTML += `<div class="calendar-header">${day}</div>`;
  });

  const weeksLeft = Math.ceil(currentCalendar.daysLeft / 7);

  for (let week = 1; week <= weeksLeft; week++) {
    calendarHTML += `<div class="week-label">Week<br>${week}</div>`;

    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      const dayCounter = (week - 1) * 7 + dayOfWeek;

      if (dayCounter > currentCalendar.daysLeft) {
        calendarHTML += `<div class="day-cell empty"></div>`;
        continue;
      }

      const isExamDay = dayCounter === currentCalendar.daysLeft;

      calendarHTML += `<div class="day-cell">`;

      calendarHTML += `
        <div class="date-label">
          Day ${dayCounter}
          ${isExamDay ? '<span class="exam-star">⭐</span>' : ''}
        </div>
      `;

      if (isExamDay) {
        calendarHTML += `
          <div class="task exam-day">
            <strong>⭐ EXAM DAY ⭐</strong><br>
            Go kill it girl 💅<br>
            You’ve done the work. Trust yourself.
          </div>
        `;
      } else if (dayCounter > currentCalendar.contentDays) {
        calendarHTML += `
          <div class="task practice">
            <strong>Final Practice</strong><br>
            Practice exam + simulation questions<br>
            ${currentCalendar.dailyPracticeHours.toFixed(1)} hrs

            ${makeCheckbox(`day-${dayCounter}-mcq`, "Completed practice MCQs")}
            ${makeCheckbox(`day-${dayCounter}-simulation`, "Completed simulation questions")}
          </div>
        `;
      } else {
        const studyStart = (dayCounter - 1) * currentCalendar.dailyContentHours;
        const studyEnd = dayCounter * currentCalendar.dailyContentHours;

        const startModule = Math.floor(studyStart / currentCalendar.hoursPerModule) + 1;
        const endModule = Math.min(
          currentCalendar.modules,
          Math.floor((studyEnd - 0.01) / currentCalendar.hoursPerModule) + 1
        );

        const moduleText =
          startModule === endModule
            ? `Module ${startModule}`
            : `Modules ${startModule}–${endModule}`;

        calendarHTML += `
          <div class="task">
            <strong>Content Study</strong><br>
            ${moduleText}<br>
            ${currentCalendar.dailyContentHours.toFixed(1)} hrs

            ${makeCheckbox(`day-${dayCounter}-module`, "Finished assigned module work")}
            ${makeCheckbox(`day-${dayCounter}-mcq`, "Completed practice MCQs")}
          </div>
        `;
      }

      calendarHTML += `</div>`;
    }
  }

  calendarHTML += `</div>`;

  calendarOutput.className = "";
  calendarOutput.innerHTML = calendarHTML;
}

function makeCheckbox(taskId, label) {
  const checked = currentCalendar.checkedTasks[taskId] ? "checked" : "";

  return `
    <label class="check-item">
      <input 
        type="checkbox" 
        ${checked}
        onchange="toggleCalendarTask('${taskId}', this.checked)"
      >
      ${label}
    </label>
  `;
}

function toggleCalendarTask(taskId, isChecked) {
  if (!currentCalendar) return;

  currentCalendar.checkedTasks[taskId] = isChecked;
  updateSavedCalendarIfExists();
}

function saveCurrentCalendar() {
  if (!currentCalendar) {
    alert("Please generate a calendar first.");
    return;
  }

  const calendars = getSavedCalendars();

  const existingIndex = calendars.findIndex(calendar => calendar.id === currentCalendar.id);

  if (existingIndex >= 0) {
    calendars[existingIndex] = currentCalendar;
  } else {
    calendars.push(currentCalendar);
  }

  localStorage.setItem("savedCalendars", JSON.stringify(calendars));
  localStorage.setItem("lastOpenedCalendarId", currentCalendar.id);

  populateSavedCalendarDropdown();

  alert("Calendar saved!");
}

function updateSavedCalendarIfExists() {
  const calendars = getSavedCalendars();
  const index = calendars.findIndex(calendar => calendar.id === currentCalendar.id);

  if (index >= 0) {
    calendars[index] = currentCalendar;
    localStorage.setItem("savedCalendars", JSON.stringify(calendars));
  }
}

function getSavedCalendars() {
  return JSON.parse(localStorage.getItem("savedCalendars")) || [];
}

function populateSavedCalendarDropdown() {
  const dropdown = document.getElementById("savedCalendars");
  const calendars = getSavedCalendars();

  dropdown.innerHTML = `<option value="">Choose saved calendar</option>`;

  calendars.forEach(calendar => {
    const option = document.createElement("option");
    option.value = calendar.id;
    option.textContent = calendar.title;
    dropdown.appendChild(option);
  });

  if (currentCalendar) {
    dropdown.value = currentCalendar.id;
  }
}

function loadSelectedCalendar() {
  const selectedId = document.getElementById("savedCalendars").value;
  if (!selectedId) return;

  const calendars = getSavedCalendars();
  const selectedCalendar = calendars.find(calendar => calendar.id === selectedId);

  if (!selectedCalendar) return;

  currentCalendar = selectedCalendar;

  document.getElementById("calendarTitle").value = currentCalendar.title;
  document.getElementById("examDate").value = currentCalendar.examDate;
  document.getElementById("modules").value = currentCalendar.modules;
  document.getElementById("studyHours").value = currentCalendar.studyHours;
  document.getElementById("practiceHours").value = currentCalendar.practiceHours;

  localStorage.setItem("lastOpenedCalendarId", currentCalendar.id);

  renderCurrentCalendar();
}

function loadLastOpenedCalendar() {
  const lastId = localStorage.getItem("lastOpenedCalendarId");
  const calendars = getSavedCalendars();

  if (!lastId || calendars.length === 0) return;

  const lastCalendar = calendars.find(calendar => calendar.id === lastId);

  if (lastCalendar) {
    currentCalendar = lastCalendar;

    document.getElementById("calendarTitle").value = currentCalendar.title;
    document.getElementById("examDate").value = currentCalendar.examDate;
    document.getElementById("modules").value = currentCalendar.modules;
    document.getElementById("studyHours").value = currentCalendar.studyHours;
    document.getElementById("practiceHours").value = currentCalendar.practiceHours;

    renderCurrentCalendar();
  }
}

function addTodo() {
  const input = document.getElementById("todoInput");
  const text = input.value.trim();

  if (!text) return;

  const todos = getTodos();

  todos.push({
    id: Date.now().toString(),
    text
  });

  localStorage.setItem("todos", JSON.stringify(todos));

  input.value = "";
  renderTodos();
}

function getTodos() {
  return JSON.parse(localStorage.getItem("todos")) || [];
}

function renderTodos() {
  const todoList = document.getElementById("todoList");
  const todos = getTodos();

  todoList.innerHTML = "";

  todos.forEach(todo => {
    const li = document.createElement("li");

    li.innerHTML = `
      <input type="checkbox" onchange="completeTodo('${todo.id}')">
      <span>${todo.text}</span>
    `;

    todoList.appendChild(li);
  });
}

function completeTodo(todoId) {
  const todos = getTodos().filter(todo => todo.id !== todoId);
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

document.addEventListener("DOMContentLoaded", () => {
  populateSavedCalendarDropdown();
  loadLastOpenedCalendar();
  renderTodos();

  document.getElementById("todoInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      addTodo();
    }
  });
});