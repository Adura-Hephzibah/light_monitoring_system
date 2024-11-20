// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Reference to the log data in Firebase
const logRef = database.ref("/log");

// Function to fetch and display log data
function fetchLogData() {
    logRef.on("value", (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            populateTable(data);
        } else {
            console.log("No data available");
        }
    }, (error) => {
        console.error("Error fetching data: ", error);
    });
}

// Function to populate the table with log data
function populateTable(data) {
    const tableBody = document.getElementById("logsTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Clear existing rows

    Object.values(data).forEach(entry => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.time1; // Assuming time1 is the start time
        row.insertCell(2).textContent = entry.time2; // Assuming time2 is the end time
        row.insertCell(3).textContent = entry.message;
    });
}

// Function to filter logs by date range
function filterLogs() {
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    // Set startDate to the beginning of the day (00:00:00)
    startDate.setHours(0, 0, 0, 0);

    // Set endDate to the end of the day (23:59:59) to include all entries for that day
    endDate.setHours(23, 59, 59, 999);

    console.log(`Start Date: ${startDate.toISOString().split('T')[0]}, End Date: ${endDate.toISOString().split('T')[0]}`); // Log the selected dates

    logRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("All Data: ", data); // Log all data for debugging

            // Filter the data based on the selected date range
            const filteredData = Object.values(data).filter(entry => {
                // Convert entry date from DD/MM/YYYY to a Date object
                const [day, month, year] = entry.date.split('/');
                const entryDate = new Date(`${year}-${month}-${day}`); // Convert to YYYY-MM-DD

                // Check if the entry date is within the range
                return entryDate >= startDate && entryDate <= endDate;
            });

            console.log("Filtered Data: ", filteredData); // Log the filtered data

            // Populate the table with filtered data
            populateTable(filteredData);
        } else {
            console.log("No data available");
        }
    });
}

// Event listener for the filter button
document.getElementById("filterButton").addEventListener("click", filterLogs);

// Fetch log data when the page loads
fetchLogData(); 