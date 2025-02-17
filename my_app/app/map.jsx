import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';


const MyLocationComponent = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { searchValue , searchId } = useLocalSearchParams();
  const [insuranceData , setInsuranceData] = useState(null)


  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      })
      .catch((error) => {
        setErrorMsg('Error getting location: ' + error.message);
      });

      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    const handleApi = async (name , id , lat , long , insurance) => {
      console.log('start')
      const response = await fetch('http://127.0.0.1:8000/api/');
      const data = await response.json();
      setInsuranceData(data);
      console.log(name)
      console.log(id)
      console.log(lat)
      console.log(long)
      console.log(data.name)
    };
    if(location){
      handleApi(searchValue , searchId , location.coords.latitude , location.coords.longitude);
    }
   
  }, [location]);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    
    text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`;
  }

  return (
    <View style={{ flex: 1 }}>
      {location ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        </MapView>
      ) : null}
      <Text>{text}</Text>
    </View>
  );
};

export default MyLocationComponent;