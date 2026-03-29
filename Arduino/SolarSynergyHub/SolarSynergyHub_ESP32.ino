#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/**
 * SOLAR SYNERGY HUB - ESP32 BLE EDITION (V4.5)
 * Right-Side Only Wiring for 30-pin ESP32 DevKit
 * 
 * Hardware Mapping (Right Side):
 * - VIN: 5V Power (Servo VCC)
 * - GND: Ground (Servo GND, OLED GND, IR GND, Button GND)
 * - D13 (GPIO13): Servo Signal (Unlock: 0, Lock: 100)
 * - D12 (GPIO12): Piezo Buzzer
 * - D14 (GPIO14): Manual Button
 * - D27 (GPIO27): IR Sensor (Occupancy)
 * - D26 (GPIO26): OLED SDA
 * - D25 (GPIO25): OLED SCL
 */

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// BLE UUIDs
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

Servo synergyLock;
const int SERVO_PIN = 13;
const int BUZZER_PIN = 12;
const int BUTTON_PIN = 14;
const int IR_SENSOR_PIN = 27;

bool isLocked = true;
bool isOccupied = false;
bool deviceConnected = false;
unsigned long lastDebounceTime = 0;
unsigned long lastOccupancyCheck = 0;

// Smart Relax: Detach servo after movement to stop humming
void moveServo(int angle) {
  synergyLock.attach(SERVO_PIN);
  synergyLock.write(angle);
  delay(600); // Wait for movement
  synergyLock.detach(); // Relax motor
}

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      pServer->getAdvertising()->start();
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();
      if (value.length() > 0) {
        String cmd = "";
        for (int i = 0; i < value.length(); i++) cmd += value[i];
        
        if (cmd == "LOCK") {
          moveServo(100);
          isLocked = true;
          digitalWrite(BUZZER_PIN, HIGH); delay(100); digitalWrite(BUZZER_PIN, LOW);
        } else if (cmd == "UNLOCK") {
          moveServo(0);
          isLocked = false;
          digitalWrite(BUZZER_PIN, HIGH); delay(500); digitalWrite(BUZZER_PIN, LOW);
        }
      }
    }
};

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(0,0);
  display.print("SYNERGY HUB V4.5");
  
  display.setCursor(0, 20);
  display.print("STATUS: ");
  display.print(isLocked ? "LOCKED" : "UNLOCKED");
  
  display.setCursor(0, 35);
  display.print("PARKING: ");
  display.print(isOccupied ? "OCCUPIED" : "VACANT");
  
  display.setCursor(0, 50);
  display.print("LINK: ");
  display.print(deviceConnected ? "CONNECTED" : "ADVERTISING");
  
  display.display();
}

void setup() {
  Serial.begin(115200);
  
  // Custom I2C for Right Side
  Wire.begin(26, 25); 
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(IR_SENSOR_PIN, INPUT);
  
  // Initial State
  moveServo(100);
  
  // BLE Setup
  BLEDevice::init("SolarSynergyHub");
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  BLEService *pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  pCharacteristic->setCallbacks(new MyCallbacks());
  pService->start();
  
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  updateDisplay();
}

void loop() {
  // Manual Button
  if (digitalRead(BUTTON_PIN) == LOW && (millis() - lastDebounceTime > 500)) {
    if (isLocked) {
      moveServo(0);
      isLocked = false;
      digitalWrite(BUZZER_PIN, HIGH); delay(500); digitalWrite(BUZZER_PIN, LOW);
    } else {
      moveServo(100);
      isLocked = true;
      digitalWrite(BUZZER_PIN, HIGH); delay(100); digitalWrite(BUZZER_PIN, LOW);
    }
    lastDebounceTime = millis();
    updateDisplay();
  }

  // IR Occupancy
  if (millis() - lastOccupancyCheck > 1000) {
    isOccupied = (digitalRead(IR_SENSOR_PIN) == LOW);
    lastOccupancyCheck = millis();
    updateDisplay();
  }
  
  delay(10);
}
