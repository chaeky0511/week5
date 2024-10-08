from flask import Flask, render_template_string, jsonify
from flask_cors import CORS  # CORS 추가
import RPi.GPIO as GPIO
import threading
import time
import Adafruit_DHT

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # 모든 출처 허용

# GPIO 설정
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

# LED 핀 설정
ledPin = [22, 23, 24]  # 에어컨, 히터, 제습기 LED 핀
ledStates = [0, 0, 0]  # LED 초기 상태 (OFF)

GPIO.setup(ledPin[0], GPIO.OUT)
GPIO.setup(ledPin[1], GPIO.OUT)
GPIO.setup(ledPin[2], GPIO.OUT)

# 터치 센서 핀 설정
TOUCH_PIN = 27
mode = "AUTO"  # 기본은 AUTO 모드
GPIO.setup(TOUCH_PIN, GPIO.IN)

# 초음파 센서 핀 설정
TRIG_PIN = 17
ECHO_PIN = 18
distance = 0
temperature = 0
humidity = 0
GPIO.setup(TRIG_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)

# DHT 센서 핀 설정
DHT_SENSOR = Adafruit_DHT.DHT11  # 사용할 DHT 센서 종류
DHT_PIN = 4  # GPIO 4번 핀

# GPIO 잠금 객체
gpio_lock = threading.Lock()

# LED 상태 업데이트
def updateLeds():
    for num, value in enumerate(ledStates):
        GPIO.output(ledPin[num], value)

# AUTO 모드에서 온습도에 따른 LED 제어
def auto_mode():
    global ledStates, temperature, humidity
    while True:
        if mode == "AUTO":
            humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
            if temperature is not None and humidity is not None:
                # LED 상태 업데이트
                if temperature >= 29:
                    if humidity >= 40:
                        ledStates = [1, 0, 1]  # 에어컨 ON, 제습기 ON
                    else:
                        ledStates = [1, 0, 0]  # 에어컨 ON, 히터, 제습기 OFF
                elif temperature <= 28:
                    if humidity >= 40:
                        ledStates = [0, 1, 1]  # 히터 ON, 제습기 ON
                    else:
                        ledStates = [0, 1, 0]  # 히터 ON, 에어컨, 제습기 OFF
                else:
                    ledStates = [0, 0, 0]  # 모든 장치 OFF
                
                updateLeds()  # LED 상태 업데이트
            else:
                print("센서 읽기 오류")
            time.sleep(1)

# 터치 센서 상태 체크 (한 번 터치로 AUTO/MANU 변경)
def monitor_touch():
    global mode
    touch_previous_state = GPIO.LOW  # 이전 터치 상태를 저장 (LOW = 터치되지 않음)

    while True:
        touch_current_state = GPIO.input(TOUCH_PIN)  # 현재 터치 상태를 읽음

        if touch_previous_state == GPIO.LOW and touch_current_state == GPIO.HIGH:
            # 이전에 터치되지 않았고, 현재 터치되었다면 모드 변경
            mode = "AUTO" if mode == "MANU" else "MANU"
            print(f"mode : {mode}")

        # 현재 상태를 이전 상태로 저장
        touch_previous_state = touch_current_state
        time.sleep(0.2)  # 짧은 간격으로 터치 상태를 체크 (200ms)


# 초음파 거리 측정
def measure_distance():
    global distance
    while True:
        GPIO.output(TRIG_PIN, True)
        time.sleep(0.00001)  # 10us 펄스 전송
        GPIO.output(TRIG_PIN, False)

        start_time = time.time()
        stop_time = time.time()

        while GPIO.input(ECHO_PIN) == 0:
            start_time = time.time()

        while GPIO.input(ECHO_PIN) == 1:
            stop_time = time.time()

        # 거리 계산
        elapsed_time = stop_time - start_time
        distance = (elapsed_time * 34300) / 2
        
        time.sleep(1)  # 1초 간격으로 거리 측정

# HTML 페이지 템플릿
html_page = '''<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Embedded System Controller</title>
    <link rel="stylesheet" type="text/css" href="{{ url_for('static', filename='web_design.css') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap">
</head>
<body>
    <div class="wrap">
        <div class="intro_bg">
            <div class="bar"></div>
        
            <ul class="nav">
                <li><a href="#">Embedded System Controller</a></li>

                <ul class="mode">
                    <div class="body">
                        <div class="tabs">
                            <input type="radio" id="auto" name="mode" value="AUTO" class="input" {% if mode == 'AUTO' %}checked{% endif %} onclick="changeMode('AUTO')" />
                            <label for="auto" class="label">AUTO</label>
                            

                            <input type="radio" id="manu" name="mode" value="MANU" class="input" {% if mode == 'MANU' %}checked{% endif %} onclick="changeMode('MANU')" />
                            <label for="manu" class="label">MANU</label>
                        </div>
                    </div>
                </ul>
            </ul>   
        </div>

        <div class="temperature-humidity">
            <div class="temperature-humidity-inner">
                <div class="temperature">
                    현재 온도: <span id="temperature">{{ current_temperature }}°C</span>
                </div>

                <div class="humidity">
                    현재 습도: <span id="humidity">{{ current_humidity }}%</span>
                </div>
            </div>

            <div class="distance">
                <p>주변 침입자 거리: <span id="distance">{{ distance | round(2) }}</span> cm</p>
            </div>
        </div>

        <ul class="icon2">
            <li> 
                <div class="text">에어컨</div>
                <div class="text">히터</div>
                <div class="text">제습기</div>

        </ul>
    </div>

    <script>
        function changeMode(newMode) {
            fetch(`/change_mode/${newMode}`, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('네트워크 응답이 좋지 않습니다.');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data.message);
                })
                .catch(error => {
                    console.error('모드 변경 오류:', error);
                });
        }

        function updateData() {
            fetch('/update_data')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('temperature').innerText = data.temperature + '°C';
                    document.getElementById('humidity').innerText = data.humidity + '%';
                    document.getElementById('distance').innerText = data.distance + ' cm';
                })
                .catch(error => console.error('데이터 업데이트 오류:', error));
        }

        setInterval(updateData, 2000);  // 2초마다 데이터 업데이트
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    global temperature, humidity, distance, mode, ledStates
    return render_template_string(html_page, 
                                  current_temperature=temperature,
                                  current_humidity=humidity,
                                  distance=distance,
                                  mode=mode,
                                  ledStates=ledStates)

@app.route('/change_mode/<new_mode>', methods=['POST'])
def change_mode(new_mode):
    global mode
    mode = new_mode
    return jsonify({"message": f"모드가 {mode}로 변경되었습니다."})

@app.route('/toggle_led/<int:led_index>', methods=['POST'])
def toggle_led(led_index):
    global ledStates
    with gpio_lock:
        ledStates[led_index] ^= 1  # LED 상태 토글
        updateLeds()
    return jsonify({"message": f"LED {led_index} 상태가 토글되었습니다."})

@app.route('/update_data', methods=['GET'])
def update_data():
    global temperature, humidity, distance
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    current_temperature = temperature if temperature is not None else 0
    current_humidity = humidity if humidity is not None else 0

    return jsonify({
        "temperature": current_temperature,
        "humidity": current_humidity,
        "distance": distance,
        "mode": mode
    })

if __name__ == '__main__':
    threading.Thread(target=auto_mode, daemon=True).start()
    threading.Thread(target=monitor_touch, daemon=True).start()
    threading.Thread(target=measure_distance, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)  # 0.0.0.0는 모든 IP에서 접근 가능
