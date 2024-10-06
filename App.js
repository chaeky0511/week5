import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Switch } from 'react-native';

const App = () => {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [distance, setDistance] = useState(0);
  const [ledStates, setLedStates] = useState([false, false, false]);
  const [mode, setMode] = useState('AUTO');

  // 실시간 데이터 업데이트
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://192.168.137.227:5000/data'); // Raspberry Pi의 IP 주소를 사용
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
    }, 5000); // 5초마다 업데이트

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#000', // 헤더 블럭의 배경색을 검은색으로 설정
    padding: 20,
    borderRadius: 10, // 모서리 둥글게
  },
  header: {
    flexDirection: 'row', // 제목과 스위치를 가로로 배치
    justifyContent: 'space-between', // 양쪽으로 배치
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white', // 글씨 색상
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    marginLeft: 10,
    color: 'white', // 글씨 색상
  },
  infoContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  temperatureBlock: {
    backgroundColor: '#fff', // 배경색 흰색
    borderColor: '#000', // 테두리 색상
    borderWidth: 1, // 테두리 두께
    borderRadius: 10, // 모서리 둥글게
    padding: 15,
    flex: 1, // 공간을 차지하도록 설정
  },
  humidityBlock: {
    backgroundColor: '#fff', // 배경색 흰색
    borderColor: '#000', // 테두리 색상
    borderWidth: 1, // 테두리 두께
    borderRadius: 10, // 모서리 둥글게
    padding: 15,
    flex: 1, // 공간을 차지하도록 설정
  },
  distanceContainer: {
    flex: 2, // 더 많은 공간을 차지하도록 설정
  },
  distanceBlock: {
    backgroundColor: '#fff', // 배경색 흰색
    borderColor: '#000', // 테두리 색상
    borderWidth: 1, // 테두리 두께
    borderRadius: 10, // 모서리 둥글게
    padding: 15,
    height: '100%', // 현재온도와 현재습도의 높이를 합친 만큼
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  humidityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  device: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  text: {
    color: 'black', // 글씨 색상
  },
});

export default App;
