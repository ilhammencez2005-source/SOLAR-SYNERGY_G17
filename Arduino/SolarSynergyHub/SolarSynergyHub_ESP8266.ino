#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Servo.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/**
 * SOLAR SYNERGY - HARDWARE HUB V3.3 (ESP8266 WIFI EDITION)
 * ETP Group 17 - Universiti Teknologi PETRONAS
 * 
 * Hardware Mapping (NodeMCU ESP12-E):
 * - Servo Motor (Lock): Pin D5 (GPIO14) [Lock: 60, Unlock: 0]
 * - Piezo Buzzer (Alert): Pin D6 (GPIO12)
 * - Manual Button: Pin D3 (GPIO0)
 * - IR Sensor (Occupancy): Pin D7 (GPIO13)
 * - OLED Display: SCL(D1/GPIO5), SDA(D2/GPIO4)
 */

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

ESP8266WebServer server(80);
Servo synergyLock;

const int SERVO_PIN = 14; // D5
const int BUZZER_PIN = 12; // D6
const int BUTTON_PIN = 0;  // D3
const int IR_SENSOR_PIN = 13; // D7

bool isLocked = true;
bool isOccupied = false;
unsigned long lastDebounceTime = 0;
unsigned long lastOccupancyCheck = 0;
unsigned long actionStartTime = 0;
bool showingAction = false;

// WiFi Icon (8x12)
const unsigned char wifi_icon[] PROGMEM = {
  0x00, 0x7E, 0x81, 0x3C, 0x42, 0x18, 0x24, 0x00, 0x18, 0x18, 0x00, 0x00
};

// --- Display Functions ---

void drawMainScreen() {
  display.clearDisplay();
  
  // WiFi Status Icon
  if (WiFi.status() == WL_CONNECTED) {
    display.drawBitmap(2, 2, wifi_icon, 8, 12, WHITE);
  }

  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(25, 28);
  display.println("SOLAR SYNERGY");
  display.setCursor(45, 43);
  display.println("ETP G17");
  display.display();
}

void drawActionScreen(bool locked) {
  display.clearDisplay();
  display.setTextColor(WHITE);
  if (locked) {
    display.fillRoundRect(44, 28, 40, 30, 4, WHITE);
    display.drawRoundRect(50, 8, 28, 30, 14, WHITE);
  } else {
    display.fillRoundRect(44, 28, 40, 30, 4, WHITE);
    display.drawRoundRect(50, 3, 28, 30, 14, WHITE);
    display.fillRect(70, 23, 15, 15, BLACK);
  }
  display.display();
}

// --- Action Functions ---

void performUnlock() {
  if (!isLocked) return;
  synergyLock.write(0); 
  isLocked = false;
  actionStartTime = millis();
  showingAction = true;
  digitalWrite(BUZZER_PIN, HIGH); 
  delay(2000); 
  digitalWrite(BUZZER_PIN, LOW);
}

void performLock() {
  if (isLocked) return;
  synergyLock.write(60);  
  isLocked = true;
  actionStartTime = millis();
  showingAction = true;
  digitalWrite(BUZZER_PIN, HIGH); delay(100); digitalWrite(BUZZER_PIN, LOW);
  delay(100); digitalWrite(BUZZER_PIN, HIGH); delay(100); digitalWrite(BUZZER_PIN, LOW);
}

// --- Web Server Handlers ---

void handleRoot() {
  server.send(200, "text/plain", "Solar Synergy Hub Online");
}

void handleLock() {
  performLock();
  server.send(200, "text/plain", "LOCKED");
}

void handleUnlock() {
  performUnlock();
  server.send(200, "text/plain", "UNLOCKED");
}

void handleStatus() {
  String status = isOccupied ? "OCCUPIED" : "AVAILABLE";
  server.send(200, "text/plain", status);
}

void setup() {
  Serial.begin(115200);
  
  // OLED Init
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) Serial.println("OLED Fail");
  
  synergyLock.attach(SERVO_PIN);
  synergyLock.write(60); 
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(IR_SENSOR_PIN, INPUT);

  // WiFi Connection
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Server Routes
  server.on("/", handleRoot);
  server.on("/lock", handleLock);
  server.on("/unlock", handleUnlock);
  server.on("/status", handleStatus);
  server.begin();

  drawMainScreen();
}

void loop() {
  server.handleClient();

  // Manual Button
  if (digitalRead(BUTTON_PIN) == LOW && (millis() - lastDebounceTime > 500)) {
    if (isLocked) performUnlock(); else performLock();
    lastDebounceTime = millis();
  }

  // IR Occupancy
  if (millis() - lastOccupancyCheck > 1000) {
    isOccupied = (digitalRead(IR_SENSOR_PIN) == LOW);
    lastOccupancyCheck = millis();
  }

  // Display Logic
  if (showingAction) {
    drawActionScreen(isLocked);
    if (millis() - actionStartTime > 3000) {
      showingAction = false;
    }
  } else {
    drawMainScreen();
  }
  
  delay(10); 
}
