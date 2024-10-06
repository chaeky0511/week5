import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modeContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 13,
    marginLeft: 6,
    color: 'white',
  },
  infoContainer: {
    marginBottom: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  temperatureBlock: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginRight: 10,
  },
  humidityBlock: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    flex: 1,
  },
  distanceContainer: {
    flex: 2,
  },
  distanceBlock: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    minHeight: 75, 
    flex: 1,
    justifyContent: 'center',   
    alignItems: 'center',       
    textAlign: 'center',        
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
    marginTop: 30,
  },
  
  device: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain',
  },
  text: {
    color: 'black',
  },
});

export default styles;
