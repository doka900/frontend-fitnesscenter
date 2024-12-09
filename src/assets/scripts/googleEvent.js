// Google API and OAuth Client Configuration
const CLIENT_ID = "240835871477-uo1as535c919u5e3pnol3j7e8ot1mb83.apps.googleusercontent.com";
const API_KEY = "AIzaSyDE7zXtaHeKKdIrxndVjfd05gk4FF7tRaQ";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES = "https://www.googleapis.com/auth/calendar";

let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", 
  });
  gisInited = true;
}

function createGoogleEvent(eventDetails) {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    await scheduleEvent(eventDetails);
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

function createGoogleEvent(eventDetails) {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      alert("Event created succsessfuly.") ; 
      throw resp;
    }
    await scheduleEvent(eventDetails); 
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

function scheduleEvent(eventDetails) {
  const event = {
    summary: eventDetails.summary || "Scheduled Program Event",
    location: eventDetails.location,
    description: eventDetails.description || "No description provided",
    start: {
      dateTime: eventDetails.startTime,
      timeZone: "Europe/Zurich",
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: "Europe/Zurich",
    },
    recurrence: eventDetails.recurrence ? [`RRULE:${eventDetails.recurrence}`] : undefined,
    attendees: eventDetails.attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const request = gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource: event,
    sendUpdates: 'all'
  });

  request.execute(function (event) {
    if (event && event.htmlLink) {
      console.info("Event created: " + event.htmlLink);
      alert("Event created succsessfuly.") ; 
    } else {
      console.error("Error creating event: ", event);
    }
  });
}