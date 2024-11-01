// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Reference to the light status in Firebase
const lightStatusRef = database.ref("/log");

// Update the UI with the light status
function updateLightStatus(data) {
  console.log("Updating light status with data:", data);

  const statusElement = document.getElementById('lightStatus');
  const dateElement = document.getElementById('date');
  const time1Element = document.getElementById('time1');
  const time2Element = document.getElementById('time2');
  const loadingIndicator = document.getElementById('loadingIndicator');

  console.log("DOM elements:", {
    statusElement,
    dateElement,
    time1Element,
    time2Element,
    loadingIndicator
  });

  // Hide loading indicator if it exists
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  } else {
    console.warn("Loading indicator element not found");
  }

  if (!statusElement) {
    console.error("Status element not found");
    return;
  }

  // Update light status based on the 'message' field
  const message = data.message;
  if (message === "No motion for 30 minutes") {
    statusElement.textContent = "Light is ON - No motion detected";
    statusElement.classList.add('on');
    statusElement.classList.remove('off');
  } else {
    statusElement.textContent = message;
    statusElement.classList.add('on');
    statusElement.classList.remove('off');
  }

  // Update timestamps and date if elements exist
  if (dateElement) dateElement.textContent = `Date: ${data.date}`;
  if (time1Element) time1Element.textContent = `From: ${data.time1}`;
  if (time2Element) time2Element.textContent = `To: ${data.time2}`;

  console.log("Light status updated successfully");
}

// Validate data
function isValidData(data) {
  return data &&
         typeof data.message === 'string' &&
         typeof data.date === 'string' &&
         typeof data.time1 === 'string' &&
         typeof data.time2 === 'string';
}

// Listen for real-time updates
lightStatusRef.on("value", (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    const latestEntry = Object.values(data).pop();  // Get the latest log entry
    if (isValidData(latestEntry)) {
      updateLightStatus(latestEntry);  // Update the UI based on the latest message
    } else {
      console.error("Invalid data format received");
      showError("Invalid data received. Please check the data format.");
    }
  } else {
    console.log("No data available");
    showError("No data available. Please check your connection.");
  }
}, (error) => {
  console.error("Error fetching data: ", error);
  showError("Error fetching data. Please try again later.");
});

// Show error message
function showError(message) {
  const statusElement = document.getElementById('lightStatus');
  statusElement.textContent = message;
  statusElement.style.color = 'red';
}

// Handle connection state changes
const connectedRef = database.ref(".info/connected");
connectedRef.on("value", (snap) => {
  if (snap.val() === true) {
    console.log("Connected to Firebase");
  } else {
    console.log("Disconnected from Firebase");
    showError("Disconnected from server. Trying to reconnect...");
  }
});
