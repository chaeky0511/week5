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
        const response = await fetch('http://172.20.10.14:5000/data'); // Raspberry Pi의 IP 주소 사용
        const data = await response.json();
        console.log("온도:", data.temperature);
        console.log("습도:", data.humidity);
        console.log("거리:", data.distance);
        setTemperature(data.temperature);
        setHumidity(data.humidity);
        setDistance(data.distance);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const interval = setInterval(() => {
      fetchData();
    }, 3000); // 3초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const toggleLED = (index) => {
    const newStates = [...ledStates];
    newStates[index] = !newStates[index];
    setLedStates(newStates);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Embedded System Controller</Text>
            <View style={styles.modeContainer}>
              <Switch value={mode === 'AUTO'} onValueChange={() => changeMode(mode === 'AUTO' ? 'MANU' : 'AUTO')} />
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
          </View>


        <View style={styles.deviceContainer}>
          {/* 에어컨 */}
          <View style={styles.device}>
            <Image source={require('./assets/images/aircon.png')} style={styles.deviceIcon} />
            <Switch value={ledStates[0]} onValueChange={() => toggleLED(0)} />
          </View>
          
          {/* 히터 */}
          <View style={styles.device}>
            <Image source={require('./assets/images/heater.png')} style={styles.deviceIcon} />
            <Switch value={ledStates[1]} onValueChange={() => toggleLED(1)} />
          </View>
          
          {/* 제습기 */}
          <View style={styles.device}>
            <Image source={require('./assets/images/hydrometer.png')} style={styles.deviceIcon} />
            <Switch value={ledStates[2]} onValueChange={() => toggleLED(2)} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;
