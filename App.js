import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, Switch } from 'react-native';
import styles from './styles';  // styles.js에서 불러오기

const App = () => {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [distance, setDistance] = useState(0);
  const [ledStates, setLedStates] = useState([false, false, false]);
  const [mode, setMode] = useState('AUTO');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://172.20.10.14:5000/update_data'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("온도:", data.temperature);
        console.log("습도:", data.humidity);
        console.log("거리:", data.distance);
        setTemperature(data.temperature);
        setHumidity(data.humidity);
        setDistance(data.distance);

        // Auto 모드일 때 LED 상태 자동으로 조정
        if (mode === 'AUTO') {
          adjustLEDStates(data.temperature, data.humidity);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const interval = setInterval(() => {
      fetchData();
    }, 3000); // 3초마다 업데이트

    return () => clearInterval(interval);
  }, [mode]); // mode에 따라 useEffect를 재실행

  const adjustLEDStates = (temperature, humidity) => {
    let newLedStates = [false, false, false]; // 초기 상태

    // 온도와 습도에 따라 LED 상태 조정
    if (temperature > 31) {
      newLedStates[0] = true; // 에어컨 켬
    } else {
      newLedStates[1] = true; // 히터 켬
    }

    // 습도가 40% 이상이면 제습기 켬
    if (humidity > 40) {
      newLedStates[2] = true; // 제습기 켬
    }

    setLedStates(newLedStates); // LED 상태 업데이트
  };

  const toggleLED = async (index) => {
    // Manual 모드일 때만 LED를 토글
    if (mode === 'MANU') {
      try {
          const response = await fetch(`http://172.20.10.14:5000/toggle_led/${index}`, { method: 'GET' });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log(data.message);

          // LED 상태 업데이트
          setLedStates((prevStates) => {
              const newStates = [...prevStates];
              newStates[index] = !newStates[index];  // 현재 상태를 반전
              return newStates;
          });

      } catch (error) {
          console.error('Error toggling LED:', error);
      }
    }
  };

  function changeMode(newMode) {
    fetch(`http://172.20.10.14:5000/change_mode/${newMode}`)  // URL 경로 수정
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();  // 응답을 JSON으로 변환
      })
      .then(data => {
        console.log('Mode changed successfully:', data);
        setMode(newMode);  // 모드 상태 업데이트
      })
      .catch(error => {
        console.error('Error changing mode:', error);
      });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Embedded System Controller</Text>
            <View style={styles.modeContainer}>
              {/* 모드 전환 Switch */}
              <Switch 
                value={mode === 'AUTO'} 
                onValueChange={() => changeMode(mode === 'AUTO' ? 'MANU' : 'AUTO')} 
              />
              <Text style={styles.modeText}>{mode}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <View style={styles.temperatureBlock}>
              <View style={styles.temperatureContainer}>
                <Image source={require('./assets/images/thermometer.png')} style={styles.icon} />
                <Text style={styles.text}>현재 온도: {temperature}°C</Text>
              </View>
            </View>

            <View style={styles.humidityBlock}>
              <View style={styles.humidityContainer}>
                <Image source={require('./assets/images/hydrometer.png')} style={styles.icon} />
                <Text style={styles.text}>현재 습도: {humidity}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.distanceContainer}>
            <View style={styles.distanceBlock}>
              <Text style={styles.text}>주변 침입자 거리: {distance.toFixed(2)} cm</Text>
              {distance <= 10 && (  // 10cm 이하일 때 경고 메시지 출력
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <Image source={require('./assets/images/thief.png')} style={[styles.icon, { marginRight: 10 }]} />
                  <Text style={[styles.text, { color: 'red', fontWeight: 'bold' }]}>
                    침입자 감지!
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.deviceContainer}>
            {/* 에어컨 */}
            <View style={styles.device}>
              <Image 
                source={require('./assets/images/aircon.png')} 
                style={[styles.deviceIcon, { marginTop: 80 }]}/>
              <Switch 
                value={ledStates[0]} 
                onValueChange={() => toggleLED(0)} 
                disabled={mode === 'AUTO'} 
              />
            </View>
            
            {/* 히터 */}
            <View style={styles.device}>
              <Image 
                source={require('./assets/images/heater.png')} 
                style={[styles.deviceIcon, { marginTop: 80 }]}/>
              <Switch 
                value={ledStates[1]} 
                onValueChange={() => toggleLED(1)} 
                disabled={mode === 'AUTO'} 
              />
            </View>
            {/* 제습기 */}
            <View style={styles.device}>
              <Image 
                source={require('./assets/images/hydrometer.png')} 
                style={[styles.deviceIcon, { marginTop: 80 }]}/>
              <Switch 
                value={ledStates[2]} 
                onValueChange={() => toggleLED(2)} 
                disabled={mode === 'AUTO'} 
              />
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;
