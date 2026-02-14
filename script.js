let simulatedDateTime = null;


function formatDate(date) {
  return date.toISOString().split("T")[0];
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
  return new Date(dateStr + " " + timeStr);
}

function updateCountdown() {
//   const now = new Date();
  const now = simulatedDateTime ? new Date(simulatedDateTime) : new Date();

  const todayStr = formatDate(now);

  const todayData = ramadanData.find(d => d.date === todayStr);
  if (!todayData) return;

  const ramadanIndex = ramadanData.findIndex(d => d.date === todayStr);
  const ramadanNumber = ramadanIndex + 1;

  document.getElementById("long-date").innerText = getLongDate(now);
  document.getElementById("ramadan-number").innerText =
    `Ramadan Day ${ramadanNumber}`;

  document.getElementById("sehri-time").innerText = todayData.sehri;
  document.getElementById("iftar-time").innerText = todayData.iftar;

  document.getElementById("top-card").classList.add("highlight-top");

  const sehriTime = convertToDateTime(todayStr, todayData.sehri);
  const iftarTime = convertToDateTime(todayStr, todayData.iftar);

  let targetTime;
  let title;

  if (now < sehriTime) {
    targetTime = sehriTime;
    title = "Time remaining until Sehri";
  } else if (now < iftarTime) {
    targetTime = iftarTime;
    title = "Time remaining until Iftar";
  } else {
    document.getElementById("countdown-title").innerText =
      "Today's fasting completed";
    document.getElementById("timer").innerText =
      "Iftar time has passed";
    return;
  }

  document.getElementById("countdown-title").innerText = title;

  const diff = targetTime - now;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("timer").innerText =
    `${hours}h ${minutes}m ${seconds}s`;

  const progressBar = document.getElementById("progress-bar");

  if (now > sehriTime && now < iftarTime) {
    const total = iftarTime - sehriTime;
    const passed = now - sehriTime;
    const percent = (passed / total) * 100;
    progressBar.style.width = percent + "%";
  } else if (now >= iftarTime) {
    progressBar.style.width = "100%";
  } else {
    progressBar.style.width = "0%";
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
