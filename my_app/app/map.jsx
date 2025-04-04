import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEvent } from 'react-native-reanimated';


const MyLocationComponent = () => {
  const { searchValue, searchId } = useLocalSearchParams();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destinations, setDestination] = useState([])
  const [markers, setMarkers] = useState([])
  const [destinationsReady, setDestinationReady] = useState(false)
  const [firstRunDone , setFristRunDone] = useState(false)
  const [isLoading, setIsLoading] = useState(true);




  // user location
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
      setIsLoading(false); 

    })();
  }, []);

  // handle django api
  useEffect(() => {
    const handleApi = async () => {
      console.log('start')

      try {
        console.log('django running')
        const response = await fetch(`https://insurance.liara.run/api/?insurance_name=${searchValue.trim()}&lat=${location?location.coords.latitude:35.700264661345145}&lng=${location?location.coords.longitude:51.337807322871065}`, {
          method: "GET",
          redirect: "follow",
          android: { useCleartextTraffic: true },
        });
        if (!response.ok) {
          throw new Error(response.status)
        }
        const data = await response.json();
        console.log(data.locations)
        setDestination(data.locations);
        console.log('api ready')
        setDestinationReady(true)
        

      }
      catch (e) {
        console.error(e.message)
      }
      
    }

    setFristRunDone(true)

    if (!destinationsReady && firstRunDone) {
      handleApi();
    }

  }, [location]);


  const markerCreator = () => {
    const newMarkers = destinations.map((item, index) => (
        <Marker
        key={index}
        coordinate={{
          latitude: item.geom.coordinates[1],
          longitude: item.geom.coordinates[0],
        }}
        title={item.title}
        description={item.address}
        
      />
      
      
    ));
    setMarkers(newMarkers)
  }


  useEffect(() => {
    console.log('marker running')
    if (destinations.length > 0) {
      markerCreator(); // Runs AFTER state updates
    }
  }, [destinationsReady]);




  return (
    
    <View style={{ flex: 1 }}>
        <MapView
          loadingEnabled = {true}
          followsUserLocation = {true}
          style={{ flex: 1 }}
          region={{
            latitude: location?location.coords.latitude:35.700264661345145,
            longitude: location? location.coords.longitude: 51.337807322871065,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {location?(<Marker
            pinColor='blue'
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title='موقعیت شما'
          />): null}
          
          {markers}

        </MapView>
      
      
    </View>
  );
};

export default MyLocationComponent;