const MAX_TRAINS = 6

let calendar = {};
let nextEventIndex = 0;
let currentEventsDisplayed = 0;

//let fakeDate = new Date(2020, 9, 11, 14, 45, 0);
//setInterval(() => { fakeDate.setTime(fakeDate.getTime() + 50000); }, 2);

function getCurrentDate() {
  return new Date();
  //return fakeDate;
}

function daysBetween(date1, date2) {
  let compDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  let compDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round(Math.abs(compDate1 - compDate2) / (1000 * 60 * 60 * 24));
}

function shortenPhrase(phrase) {
  return phrase.replace(/(?<!\b)[AaEeIiOoUu](?!\b)/g, "")
}

function addEvent(evnt) {
  let table = document.getElementById("timetable");
  let footer = document.querySelector("#timetable > p.footer");
  
  let time = document.createElement("p");
  let destination = document.createElement("p");
  let platform = document.createElement("p");
  let status = document.createElement("p");
  
  time.classList.add("train");
  destination.classList.add("train");
  platform.classList.add("train");
  status.classList.add("train");
  
  time.textContent = dateToTimeReadout(evnt.start);
  destination.textContent = shortenPhrase(evnt.summary);
  platform.textContent = shortenPhrase(evnt.location);
  
  table.insertBefore(time, footer);
  table.insertBefore(destination, footer);
  table.insertBefore(platform, footer);
  table.insertBefore(status, footer);
  currentEventsDisplayed++;
  
  let updateDescription = () => {
    let elem = document.getElementById("description");
    elem.textContent = evnt.description;
  }
  
  time.addEventListener("click", updateDescription);
  destination.addEventListener("click", updateDescription);
  platform.addEventListener("click", updateDescription);
  status.addEventListener("click", updateDescription);
  
  let updateFunc = () => {
    let now = getCurrentDate();
    if (now.getDate() != evnt.start.getDate() || now.getMonth() != evnt.start.getMonth() || now.getFullYear() != evnt.start.getFullYear()) {
      status.textContent = "DELAYED " + daysBetween(now, evnt.start) + "DY";
    } else if (now >= evnt.start && now <= evnt.end) {
      status.textContent = "BOARDING";
    } else if (now < evnt.start) {
      status.textContent = "ON TIME";
    } else {
      table.removeChild(time);
      table.removeChild(destination);
      table.removeChild(platform);
      table.removeChild(status);
      currentEventsDisplayed--;
      update();
      return;
    }
    
    setTimeout(updateFunc, 500);
  };
  setTimeout(updateFunc, 0);
}

function dateToTimeReadout(date) {
  return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0")
}

function update() {
  let now = getCurrentDate();
  while (currentEventsDisplayed < MAX_TRAINS) {
    if (nextEventIndex >= calendar.events.length) {
      break;
    }
    let nextEvent = calendar.events[nextEventIndex];
    if (now <= nextEvent.end) {
      addEvent(nextEvent);
    }
    nextEventIndex++;
  }
}

function updateTimeLoop() {
  let elem = document.getElementById("timedisplay");
  let now = getCurrentDate();
  elem.textContent = dateToTimeReadout(now) + ":" + now.getSeconds().toString().padStart(2, "0");
  setTimeout(updateTimeLoop, 980);
}

window.addEventListener("load", async () => {
  const url = new URLSearchParams(window.location.search).get("url");
  
  if (url === null) {
    alert("Please put the URL to your iCal calendar in the url query param. Example: ?url=http://example.com/john.ical");
    return;
  }
  
  try {
    calendar = await getCalendarFromUrl(url);
  } catch (e) {
    if (e.message.includes("NetworkError")) {
      console.log("Failed to fetch calendar, assuming CORS issue. Attempting proxy...");
      calendar = await getCalendarFromUrl("http://localhost:8080/" + url);
    }
    else {
      alert(e);
      throw e;
    }
  }
  calendar.events.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  document.title = calendar.title;
  
  update();
  updateTimeLoop();
});
