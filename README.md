# Light Monitoring and Notification System

This project monitors light usage in a room using NodeMCU (ESP8266), logging data to Firebase, and sending notifications through IFTTT when lights are left on without room occupancy.

This sysytem is used to track ligt usuage during night cycles from 6PM TO 7AM.

The system sends notifications to the user if the light is left on when no motion is detected, helping to reduce energy wastage. Data is also displayed in a web app for real-time monitoring.


## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Hardware Details](#hardware-details)
4. [Installation Instructions](#installation-instructions)
5. [Usage](#usage)
6. [Data Analysis](#data-analysis)
7. [Web App](#web-app)
8. [Future Work](#future-work)
9. [Acknowledgements](#acknowledgements)

---

### 1. Overview

The **Light Monitoring and Notification System** project aims to minimize unnecessary electricity usage in buildings by monitoring room occupancy and light status. The project comprises a NodeMCU-based sensors system deployed in the room, sending data to Firebase and triggering IFTTT notifications when lights are unnecessarily left on.

### 2. Features
- **Real-time Light Status Monitoring**: Tracks and logs when lights are turned on without motion.
- **Occupancy Detection**: Detects room occupancy using PIR sensors.
- **IFTTT Notifications**: Alerts users when lights are on in empty rooms via email.
- **Web App**: Provides a dashboard for data logging so it can be monitored in real time.

### 3. Hardware Details

#### Components Used
- **NodeMCU (ESP8266)**: Microcontroller to control sensors and manage communication with Firebase.
- **LDR**: Light sensor to detect the on/off status of lights.
- **PIR Sensor**: Motion detector to identify room occupancy.
- **RTC (DS1307)**: Real-time clock to timestamp data accurately.
- **Resistors and LEDs**: Supporting components for sensor calibration and testing.

#### PCB Design
All components are mounted on a custom PCB designed for durability and ease of deployment. Refer to the [PCB Design](./hardware_details/pcb_files/) section for the design files and layouts.

#### Datasheets Summary
Details on each component can be found in the [Datasheets Summary](./hardware_details/datasheets.md) file, including:
- LDR sensitivity range and response time.
- RTC backup and accuracy specifications.
- PIR sensor range and sensitivity.
- LED and resistor specifications for optimal current handling.

### 4. Installation Instructions

### Prerequisites:
- NodeMCU or ESP8266
- Arduino IDE
- Firebase account
- PIR motion sensor and LDR sensor
- Circuit setup (refer to the circuit diagram and pcb design files)

1. **Hardware Setup**:
   - Connect the LDR, PIR sensor, and RTC to the NodeMCU as per the PCB design.
   - Deploy each NodeMCU device in separate rooms.

2. **Software Setup**:
   - Clone this repository:
     ```bash
     git clone https://github.com/Adura-Hephzibah/light_monitoring_system.git
     ```
   - Open the Arduino IDE, install required libraries:
     - `FirebaseESP8266`
     - `ESP8266WiFi`
   - Set up your Firebase project:
      - Create a Firebase Realtime Database.
   - Configure Firebase settings in the code:
     - Add your Firebase project URL and API key.
   - Configure IFTTT settings for notifications.

3. **Run the Code**:
   - Upload the code to each NodeMCU device.
   - Monitor the Firebase Realtime Database to ensure data is logging correctly.

4. **Web App Setup**:
   - Deploy the `web_app` directory to a suitable web server or hosting platform.
   - Update Firebase configuration in the web app for real-time data visualization.

### 5. Usage
- **Monitoring**: View real-time light and occupancy status on the web app dashboard.
- **Notifications**: Receive alerts when lights are on without room occupancy.

### 6. Data Analysis

#### Energy Wastage Calculation
To calculate energy wastage, you need the  wasted hours recorded by the system.

#### Cost Estimation
To estimate energy costs:
1. **Formula**: Total cost = Wasted kWh * Electricity rate
2. **Wasted Hours**: Calculated based on timestamps from the RTC and logged in Firebase.


### 7. Web App

#### Overview
The web app visualizes real-time data. Key features include:
- **Main Page**: This displays the latest logging when there is no motion and the light status is ON.
- **Dashboard**: That displayed the 20 most recent log enteries in the database.


#### Demo Video
A short [demo video](#) is available to demonstrate and eplain the system.

### 8. Future Work
- **DayTime Monitoring**: Implement the system to include monitoring light status during the day.
- **Enhanced Web Interface**: Incorporate a more detailed data filtering system.

### 9. Acknowledgements
Special thanks to my supervisor, Mr. Thadee Gatera for guidance and support, and to ThankGod Ihesie for his insightful contributions.

---

### Additional Files
- **[Hardware_Details/](./Hardware_Details/)**: Contains PCB design files, datasheets summary, and other hardware details.
- **`src/`**: Contains the main code files for NodeMCU.
- **`web_app/`**: Contains the source code for the web app dashboard.
