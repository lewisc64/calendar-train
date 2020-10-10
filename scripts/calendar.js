async function fetchRawCalendar(url) {
  let options = {
    mode: "cors",
  };
  let response = await fetch(url, options);
  let content = await response.text();
  return content;
}

async function getCalendarFromUrl(url) {
  return parseCalendar(await fetchRawCalendar(url))
}

function parseDate(d) {
  return new Date(d.substring(0, 4), parseInt(d.substring(4, 6)) - 1, d.substring(6, 8), d.substring(9, 11), d.substring(11, 13), d.substring(13, 15));
}

function parseCalendar(content) { // TODO: Timezones.
  let calendar = {
    title: "Calendar",
    events: [],
  };
  
  let currentEvent = null;
  
  for (let match of content.matchAll(/(^.+?):(.+(?:\r?\n .+)*)/gm)) {
    const label = match[1];
    const value = match[2]
      .replace(/\r?\n /g, "")
      .replace(/\\n/g, "\n")
      .replace(/\\(.)/g, "$1");
    
    if (label === "X-WR-CALNAME") {
      calendar.title = value;
    }
    
    if (label === "BEGIN" && value === "VEVENT") {
      currentEvent = {
        summary: "Event",
        description: "-",
        location: "N/A",
        uid: null,
        start: null,
        end: null,
      };
    }
    
    if (label === "END" && value === "VEVENT") {
      calendar.events.push(currentEvent);
      currentEvent = null;
    }
    
    if (currentEvent) {
      if (label.startsWith("DTSTART")) {
        currentEvent.start = parseDate(value);
      }
      else if (label.startsWith("DTEND")) {
        currentEvent.end = parseDate(value);
      }
      else if (label === "SUMMARY") {
        currentEvent.summary = value;
      }
      else if (label === "DESCRIPTION") {
        currentEvent.description = value;
      }
      else if (label === "LOCATION") {
        currentEvent.location = value;
      }
      else if (label === "UID") {
        currentEvent.uid = value;
      }
    }
  }
  
  return calendar;
}
