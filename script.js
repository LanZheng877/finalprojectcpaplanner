function generatePlan() {
  const examDate = document.getElementById("examDate").value;
  const modules = Number(document.getElementById("modules").value);
  const studyHours = Number(document.getElementById("studyHours").value);
  const practiceHours = Number(document.getElementById("practiceHours").value);

  const summaryOutput = document.getElementById("summaryOutput");
  const calendarOutput = document.getElementById("calendarOutput");

  if (!examDate || modules <= 0 || studyHours <= 0 || practiceHours < 0) {
    summaryOutput.innerHTML = `<p class="error">Please fill out all fields correctly.</p>`;
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

  summaryOutput.innerHTML = `
    <p><strong>Days until exam:</strong> ${daysLeft}</p>
    <p><strong>Content study period:</strong> ${contentDays} days</p>
    <p><strong>Final practice period:</strong> Last 7 days</p>
    <p><strong>Estimated time per module:</strong> ${hoursPerModule.toFixed(1)} hours</p>
    <p><strong>Daily content study goal:</strong> ${dailyContentHours.toFixed(1)} hours per day</p>
  `;

  createCalendar(
    daysLeft,
    contentDays,
    modules,
    hoursPerModule,
    dailyContentHours,
    dailyPracticeHours
  );
}

function createCalendar(
  daysLeft,
  contentDays,
  modules,
  hoursPerModule,
  dailyContentHours,
  dailyPracticeHours
) {
  const calendarOutput = document.getElementById("calendarOutput");
  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  let calendarHTML = `<div class="calendar">`;

  calendarHTML += `<div class="calendar-header"></div>`;

  days.forEach(day => {
    calendarHTML += `<div class="calendar-header">${day}</div>`;
  });

  const weeksLeft = Math.ceil(daysLeft / 7);

  for (let week = 1; week <= weeksLeft; week++) {
    calendarHTML += `<div class="week-label">Week<br>${week}</div>`;

    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      const dayCounter = (week - 1) * 7 + dayOfWeek;

      if (dayCounter > daysLeft) {
        calendarHTML += `<div class="day-cell empty"></div>`;
        continue;
      }

      const isExamDay = dayCounter === daysLeft;

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
      } else if (dayCounter > contentDays) {
        calendarHTML += `
          <div class="task practice">
            <strong>Final Practice</strong><br>
            Practice exam + simulation questions<br>
            ${dailyPracticeHours.toFixed(1)} hrs

            <label class="check-item">
              <input type="checkbox">
              Completed practice MCQs
            </label>

            <label class="check-item">
              <input type="checkbox">
              Completed simulation questions
            </label>
          </div>
        `;
      } else {
        const studyStart = (dayCounter - 1) * dailyContentHours;
        const studyEnd = dayCounter * dailyContentHours;

        const startModule = Math.floor(studyStart / hoursPerModule) + 1;
        const endModule = Math.min(
          modules,
          Math.floor((studyEnd - 0.01) / hoursPerModule) + 1
        );

        let moduleText = "";

        if (startModule === endModule) {
          moduleText = `Module ${startModule}`;
        } else {
          moduleText = `Modules ${startModule}–${endModule}`;
        }

        calendarHTML += `
          <div class="task">
            <strong>Content Study</strong><br>
            ${moduleText}<br>
            ${dailyContentHours.toFixed(1)} hrs

            <label class="check-item">
              <input type="checkbox">
              Finished assigned module work
            </label>

            <label class="check-item">
              <input type="checkbox">
              Completed practice MCQs
            </label>
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