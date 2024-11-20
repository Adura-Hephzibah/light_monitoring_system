// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Reference to the log data in Firebase
const logRef = database.ref("/log");

// Variables to hold chart instances
let lightChart; // Store the light chart instance
let allDataChart; // Store the all data chart instance

// Function to fetch and process log data
function fetchLogData() {
    logRef.on("value", (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const startDateInput = document.getElementById("startDate").value;
            const endDateInput = document.getElementById("endDate").value;

            // Convert input dates to Date objects
            const startDate = new Date(startDateInput);
            const endDate = new Date(endDateInput);

            // Set startDate to the beginning of the day (00:00:00)
            startDate.setHours(0, 0, 0, 0);

            // Set endDate to the end of the day (23:59:59)
            endDate.setHours(23, 59, 59, 999);

            console.log("Start Date:", startDate);
            console.log("End Date:", endDate);

            // Filter data based on the selected date range
            const filteredData = filterDataByDate(data, startDate, endDate);
            console.log("Filtered Data:", filteredData); // Log filtered data for debugging

            const groupedDataByDate = groupDataByDate(filteredData);
            console.log("Grouped Data By Date:", groupedDataByDate); // Log grouped data for debugging

            createChart(groupedDataByDate); // Create chart for filtered data
            createAllDataChart(data); // Create chart for all logged data

            // Calculate total hours wasted and electricity cost
            const totalHoursWasted = calculateTotalHoursWasted(filteredData);
            const bulbWattage = parseFloat(document.getElementById("bulbWattage").value) || 300; // Default to 300 if not provided
            const electricityRate = parseFloat(document.getElementById("electricityRate").value) || 249; // Default to 249 if not provided
            const totalCost = calculateElectricityCost(totalHoursWasted, bulbWattage, electricityRate);
            const nameOfRoom = document.getElementById("roomName").value;

            // Display the total cost on the page
            document.getElementById('totalCost').textContent = `Total Electricity Cost: RWF ${totalCost}`;

            document.getElementById('displayRoomName').textContent = `Total Electricity Cost for ${nameOfRoom}`;
        } else {
            console.log("No data available");
        }
    }, (error) => {
        console.error("Error fetching data: ", error);
    });
}

// Function to filter data by date range
function filterDataByDate(data, startDate, endDate) {
    const filteredData = {};
    Object.entries(data).forEach(([key, entry]) => {
        // Parse the entry date from DD/MM/YYYY format
        const entryDateParts = entry.date.split('/'); // Assuming entry.date is in DD/MM/YYYY format
        const entryDate = new Date(`${entryDateParts[2]}-${entryDateParts[1]}-${entryDateParts[0]}`); // Convert to YYYY-MM-DD

        // Log the entry date for debugging
        console.log("Entry Date:", entryDate);

        // Ensure the end date is inclusive and the start date is inclusive
        if (entryDate >= startDate && entryDate <= endDate) {
            filteredData[key] = entry;
        }
    });
    return filteredData;
}

// Function to group data by date and calculate total time left on
function groupDataByDate(data) {
    const grouped = {};
    Object.values(data).forEach((entry) => {
        const date = entry.date;
        const message = entry.message;

        if (!grouped[date]) {
            grouped[date] = 0; // Initialize total time for this date
        }

        if (message === "No motion for 30 minutes") {
            grouped[date] += 30; // Assuming the message indicates 30 minutes
        }
    });

    return grouped;
}

// Function to create a chart using Chart.js for filtered data
function createChart(groupedData) {
    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    const ctx = document.getElementById("lightChart").getContext("2d");

    // Destroy the existing chart if it exists
    if (lightChart) {
        lightChart.destroy();
    }

    // Create a new chart instance
    lightChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Time Bulb Left On (minutes)",
                    data: data,
                    backgroundColor: "rgba(76, 175, 80, 0.5)",
                    borderColor: "rgba(76, 175, 80, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Minutes",
                    },
                    ticks: {
                        stepSize: 60, // Set the interval to 60
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Date",
                    },
                },
            },
        },
    });
}

// Function to create a chart using Chart.js for all logged data
function createAllDataChart(data) {
    const allDataGrouped = groupDataByDate(data); // Group all data
    const labels = Object.keys(allDataGrouped);
    const allData = Object.values(allDataGrouped);

    const ctx = document.getElementById("allDataChart").getContext("2d");

    // Destroy the existing chart if it exists
    if (allDataChart) {
        allDataChart.destroy();
    }

    // Create a new chart instance
    allDataChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total Time Bulb Left On (minutes)",
                    data: allData,
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Minutes",
                    },
                    ticks: {
                        stepSize: 60, // Set the interval to 60
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Date",
                    },
                },
            },
        },
    });
}

// Function to calculate total hours wasted
function calculateTotalHoursWasted(data) {
    let totalMinutes = 0;

    Object.values(data).forEach(entry => {
        if (entry.message === "No motion for 30 minutes") {
            totalMinutes += 30; // Assuming the message indicates 30 minutes
        }
    });

    return totalMinutes / 60; // Convert minutes to hours
}

// Function to calculate electricity cost
function calculateElectricityCost(totalHours, bulbWattage, electricityRate) {
    const totalWattage = bulbWattage * totalHours; // Total wattage used
    const totalKilowattHours = totalWattage / 1000; // Convert to kWh
    const totalCost = totalKilowattHours * electricityRate; // Calculate cost
    return totalCost.toFixed(2); // Return cost rounded to 2 decimal places
}

// Event listener for the calculate button
document.getElementById('calculateButton').addEventListener('click', fetchLogData);

// Fetch log data when the page loads
fetchLogData();
