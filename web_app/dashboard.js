// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Reference to the light status in Firebase
const logRef = database.ref("/log");

// Update the UI with log entries
function updateLogUI(data) {
  const logContainer = document.getElementById('logContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');

  // Remove loading indicator
  if (loadingIndicator) {
    loadingIndicator.remove();
  }

  // Clear previous logs
  logContainer.innerHTML = '';

  const logEntries = Object.values(data).reverse().slice(0, 20);  // Get 20 most recent log entries in reverse order

  // Iterate through log entries and update the UI
  logEntries.forEach((entry) => {
    const logDiv = document.createElement('div');
    logDiv.classList.add('log-entry');

    // Set class based on the message
    if (entry.message === "No motion for 30 minutes") {
      logDiv.classList.add('on');
    } else {
      logDiv.classList.add('on');
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('log-message');
    messageDiv.textContent = entry.message === "No motion for 30 minute"
      ? "Light is ON - No motion detected"
      : entry.message;
    logDiv.appendChild(messageDiv);

    // Log date and time
    const logDetails = document.createElement('div');
    logDetails.classList.add('log-details');
    logDetails.innerHTML = `
      <p>Date: ${entry.date}</p>
      <p class="timestamp">From: ${entry.time1}</p>
      <p class="timestamp">To: ${entry.time2}</p>
    `;
    logDiv.appendChild(logDetails);

    // Append to the log container
    logContainer.appendChild(logDiv);
  });
}

// Fetch logs from Firebase Realtime Database
logRef.on("value", (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    updateLogUI(data);  // Update the UI with the log data
  } else {
    console.log("No data available");
    document.getElementById('logContainer').textContent = "No logs available.";
  }
}, (error) => {
  console.error("Error fetching data: ", error);
  document.getElementById('logContainer').textContent = "Error loading logs. Please try again later.";
});
