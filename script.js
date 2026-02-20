let simulatedDateTime = null;


function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


function getLongDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function convertToDateTime(dateStr, timeStr) {
  const [hoursMinutes, modifier] = timeStr.split(" ");
  let [hours, minutes] = hoursMinutes.split(":");

  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  const date = new Date(dateStr);
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  return date;
}


function updateCountdown() {

  const now = simulatedDateTime ? new Date(simulatedDateTime) : new Date();
  const todayStr = formatDate(now);

  const todayIndex = ramadanData.findIndex(d => d.date === todayStr);
  if (todayIndex === -1) return;

  const todayData = ramadanData[todayIndex];
  const ramadanNumber = todayIndex + 1;

  //document.getElementById("long-date").innerText = getLongDate(now);
  document.getElementById("ramadan-number").innerText =
    `Ramadan Day ${ramadanNumber}`;

  document.getElementById("sehri-time").innerText = todayData.sehri;
  document.getElementById("iftar-time").innerText = todayData.iftar;

  const sehriTime = convertToDateTime(todayStr, todayData.sehri);
  const iftarTime = convertToDateTime(todayStr, todayData.iftar);

  if (isNaN(sehriTime) || isNaN(iftarTime)) {
    console.error("Invalid date parsing");
    return;
  }

  let targetTime;
  let title;

  if (now < sehriTime) {
    targetTime = sehriTime;
    title = "Remaining time until Sehri";
  }
  else if (now < iftarTime) {
    targetTime = iftarTime;
    title = "Remaining time until Iftar";
  }
  else {
    // After Iftar → next day's Sehri

    const nextIndex = todayIndex + 1;

    if (nextIndex >= ramadanData.length) {
      document.getElementById("countdown-title").innerText =
        "Ramadan completed 🌙";
      document.getElementById("timer").innerText = "";
      return;
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const nextDateStr = formatDate(tomorrow);
    const nextDayData = ramadanData[nextIndex];

    targetTime = convertToDateTime(nextDateStr, nextDayData.sehri);
    title = "Remaining time until Sehri";
  }

  document.getElementById("countdown-title").innerText = title;

  const diff = targetTime - now;

  if (diff <= 0) return;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("timer").innerText =
    `${hours}h ${minutes}m ${seconds}s`;

  const progressBar = document.getElementById("progress-bar");
  const wavyFill = document.getElementById("wavy-fill");

  if (now < sehriTime) {
    const midnight = new Date(todayStr + "T00:00:00");
    const total = sehriTime - midnight;
    const passed = now - midnight;
    const pct = (passed / total) * 100;
    progressBar.style.width = pct + "%";
    if (wavyFill) wavyFill.style.width = pct + "%";
  }
  else if (now < iftarTime) {
    const total = iftarTime - sehriTime;
    const passed = now - sehriTime;
    const pct = (passed / total) * 100;
    progressBar.style.width = pct + "%";
    if (wavyFill) wavyFill.style.width = pct + "%";
  }
  else {
    progressBar.style.width = "100%";
    if (wavyFill) wavyFill.style.width = "100%";
  }
}



function loadTable() {
  const tbody = document.querySelector("#schedule-table tbody");
  const todayStr = formatDate(new Date());

  ramadanData.forEach((data, index) => {
    const row = document.createElement("tr");

    if (data.date === todayStr) {
      row.classList.add("highlight-row");
    }

    const dateObj = new Date(data.date);

    row.innerHTML = `
      <td>${dateObj.toLocaleDateString("en-US", { weekday: "long" })}</td>
      <td>${dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
      <td>${index + 1}</td>
      <td>${data.sehri}</td>
      <td>${data.iftar}</td>
    `;

    tbody.appendChild(row);
  });
}

function applyTestTime() {
  const dateInput = document.getElementById("test-date").value;
  const timeInput = document.getElementById("test-time").value;

  if (!dateInput || !timeInput) return;

  simulatedDateTime = new Date(dateInput + "T" + timeInput);
  updateCountdown();
}

function updateHeaderClock() {
  const now = new Date();

  const longDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  document.getElementById("header-date").innerText = longDate;
  document.getElementById("live-clock").innerText = timeString;
}



loadTable();
setInterval(updateCountdown, 1000);
updateCountdown();
setInterval(updateHeaderClock, 1000);
updateHeaderClock();

