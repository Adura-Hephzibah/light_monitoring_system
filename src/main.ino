#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include "RTClib.h"

#if defined(ESP32)
#include <WiFi.h>
#include <FirebaseESP32.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#endif

//Provide the token generation process info.
#include <addons/TokenHelper.h>

//Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

// Insert your network credentials
#define WIFI_SSID "USE_YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"


// Insert Firebase project API Key
#define API_KEY "USE_YOUR_KEY"

// Insert Realtime Database URL
#define DATABASE_URL "light-monitoring-system-28c78-default-rtdb.europe-west1.firebasedatabase.app/"  // Without "https://"

//Define the user Email and password that already registerd or added in your project
#define USER_EMAIL "YOUR_EMAIL"
#define USER_PASSWORD "YOUR_PASSWORD"

//Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

FirebaseData firebaseData;

//RTC Data object
RTC_DS1307 rtc;

char days[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

// RTC Clock SCL = D1, SDA = D2
int sensor = 14;  // Digital pin D5 for PIR sensor
int led = 12;     // Digital pin D6 for LED
const int ldrPin = A0;  // LDR connected to A0


void setup() {
  Serial.begin(115200);

  pinMode(sensor, INPUT);   // PIR sensor
  pinMode(ldrPin, INPUT);   // LDR sensor
  pinMode(led, OUTPUT);     // LED output

  // Initialize WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

 // For anonymous authentication (can be changed to email/password auth if needed)
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign the callback function for the token status
  config.token_status_callback = tokenStatusCallback;  // See TokenHelper.h

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Initialize RTC
  if (!rtc.begin()) {
    Serial.println("Could not find RTC! Check circuit.");
    while (1);
  }

  // rtc.adjust(DateTime(__DATE__, __TIME__));
  // Serial.println("RTC adjusted to compile time");

  Serial.println("RTC is running");
  delay(100);

}

void loop() {
  DateTime now = rtc.now();

  // Display current time
  Serial.printf("%02d:%02d:%02d\n", now.hour(), now.minute(), now.second());

  // Display date and day of the week
  Serial.printf("%s - %02d/%02d/%d\n", days[now.dayOfTheWeek()], now.day(), now.month(), now.year());

  checktime();  // Check for working hours or non-working hours

  delay(500);
}

void checktime() {
  DateTime now = rtc.now();
  if (now.hour() >= 7 && now.hour() < 18) {  // Working hours: 7 AM - 6 PM
    Serial.println("Working hours");
    Serial.println("Waiting for night cycle");
  } else {
    Serial.println("Non-working hours");
    checklight2();
  }

}

void checklight2() {
  int ldrStatus = analogRead(ldrPin);
  if (ldrStatus >= 70) {
    Serial.printf("%d - Light detected\n", ldrStatus);
    checkmotion();
  } else {
    Serial.printf("%d - Light OFF\n", ldrStatus);
  }
}

void checkmotion() {
  bool motionDetected = false;  // Track if motion has been detected

  for (int i = 0; i < 1800; i++) {  // Monitor for 1800 seconds (30 minutes)
    // First check LDR reading
    int ldrStatus = analogRead(ldrPin);

    // If room is dark, exit the function completely
    if (ldrStatus < 120) {  // Dark condition
        Serial.printf("Room is dark (LDR: %d). Stopping monitoring.\n", ldrStatus);
        digitalWrite(led, LOW);
        return;  // Exit function, don't send any message
    }

    if (digitalRead(sensor) == HIGH) {  // Motion detected
      motionDetected = true;  // Set flag to indicate motion was detected
      digitalWrite(led, HIGH);  // Turn LED on
      Serial.println("Motion detected!");
      break;  // Exit the loop since motion is detected
    } else {
      Serial.print("No motion ");
      digitalWrite(led, LOW);  // Turn LED off
    }

    Serial.println(i);  // Print the counter value
    delay(1000);  // 1-second delay
  }

  // If no motion was detected in the last 1800 seconds
  if (!motionDetected) {
    Serial.println("No motion for 30 minutes");
    sendmessage();  // Send message to Firebase
  }
}

void sendmessage()
{
  DateTime now = rtc.now();

  // Check if Firebase is ready before sending data
  if (!Firebase.ready()) {
    Serial.println("Firebase not ready, cannot send data.");
    return;
  }

  // Calculate previous time 30 minutes earlier
  int oldMinute = now.minute() - 30;
  int oldHour = now.hour();
  int oldDay = now.day();
  int oldMonth = now.month();
  int oldYear = now.year();

  if (oldMinute < 0) {        // If subtracting 30 minutes goes negative
    oldMinute += 60;          // Add 60 to minutes
    oldHour -= 1;             // Subtract 1 hour

    if (oldHour < 0) {        // If subtracting 1 hour goes below 0
      oldHour = 23;           // Set hour to 23 (previous day)
      oldDay -= 1;            // Subtract 1 day

      if (oldDay < 1) {       // If day goes below 1, adjust month and year
        oldMonth -= 1;
        if (oldMonth < 1) {
          oldMonth = 12;
          oldYear -= 1;
        }
        // Set oldDay to the last day of the previous month
        oldDay = daysInMonth(oldMonth, oldYear);
      }
    }
  }

  // Format the dates and times as strings
  String currentDate = String(now.day()) + "/" + String(now.month()) + "/" + String(now.year());
  String previousTime = String(oldHour) + ":" + String(oldMinute) + ":" + String(now.second());
  String currentTime = String(now.hour()) + ":" + String(now.minute()) + ":" + String(now.second());

  // Create and send the JSON object
  FirebaseJson json;
  json.set("message", "No motion for 30 minutes");
  json.set("date", currentDate);
  json.set("time1", previousTime);
  json.set("time2", currentTime);

  if (Firebase.pushJSON(fbdo, "/log", json)) {
    Serial.println("Data sent to Firebase:");
    Serial.println("Message: No motion for 30 minutes");
    Serial.println("Date: " + currentDate);
    Serial.println("Time1: " + previousTime);
    Serial.println("Time2: " + currentTime);

    // Trigger the IFTTT webhook
    // Also putting it in this if block ensures this webhook is only triggered if data is sucessfully logged to the database
    triggerIFTTTWebhook();
  } else {
    Serial.println("Failed to send data to Firebase:");
    Serial.println(fbdo.errorReason());
  }
}

void triggerIFTTTWebhook() {
  WiFiClient client;
  HTTPClient http;
  String url = "http://maker.ifttt.com/trigger/no_motion/with/key/bqLs0YEAqB8WScTb3944QX";

  http.begin(client, url);
  int httpCode = http.GET();
  if (httpCode > 0) {
    Serial.println("IFTTT Webhook triggered successfully");
  } else {
    Serial.println("Error triggering IFTTT Webhook");
  }
  http.end();
}

// Helper function to find the number of days in a given month (taking leap years into account)
int daysInMonth(int month, int year) {
  if (month == 2) return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) ? 29 : 28;
  else if (month == 4 || month == 6 || month == 9 || month == 11) return 30;
  else return 31;
}


