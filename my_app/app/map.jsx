import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEvent } from 'react-native-reanimated';


const MyLocationComponent = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { searchValue, searchId } = useLocalSearchParams();
  const [insuranceData, setInsuranceData] = useState(null)
  const [destinations, setDestination] = useState([])
  const [markers, setMarkers] = useState([])
  const [insuranceDataReady, setInsuranceDataReady] = useState(false)
  const [destinationsReady, setDestinationReady] = useState(false)




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
    })();
  }, []);

  // handle django api
  useEffect(() => {
    const handleApi = async () => {
      console.log('start')
      try {
        console.log('django running')
        const response = await fetch('https://a316-57-128-190-60.ngrok-free.app/api/', {
          method: "GET",
          redirect: "follow",
          android: { useCleartextTraffic: true },
        });
        if (!response.ok) {
          throw new Error(response.status)
        }
        const data = await response.json();

        setInsuranceData(data);
        if (!insuranceData == []) {
          console.log('api ready')
          setInsuranceDataReady(true)
        }

      }
      catch (e) {
        console.error(e.message)
      }
    };

    if (!insuranceDataReady) {
      handleApi();
    }

  }, [location]);

  // useEffect(()=>{
  //   setTimeout(() => {
  //     setRecallDjango(!recallDjango)
  //   }, 5000);
  // } , [location])


  // handle map.ir api
  const findLocation = async (hospital) => {
    console.log('map api running')
    console.log(hospital)
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImJiNWY5NmJkMDgyY2U0MGNiNGQyOWQyYjViZDE2ODI3MGZkMjA0YjE1MGYwZDlkYjNlZjE4OTc4NWQ4ZTFiZjgwYWU2ZTUzZGM4NzBiNzg1In0.eyJhdWQiOiIzMTE0NCIsImp0aSI6ImJiNWY5NmJkMDgyY2U0MGNiNGQyOWQyYjViZDE2ODI3MGZkMjA0YjE1MGYwZDlkYjNlZjE4OTc4NWQ4ZTFiZjgwYWU2ZTUzZGM4NzBiNzg1IiwiaWF0IjoxNzM5OTQ3OTQ5LCJuYmYiOjE3Mzk5NDc5NDksImV4cCI6MTc0MjQ1MzU0OSwic3ViIjoiIiwic2NvcGVzIjpbImJhc2ljIl19.kk4nUtN2iRISC-qcZHlJzLAQwoySB_Mkq33DF1vQX-jQkPfuhU1sxwyPrrLnC1ffSzI7r__RohUD3zm2W9P2PVZRGYFErel5Y_WYPKWOkADkbfj7cxXHn7Tod-MRV0Xw0CJ3xKsVSFvp2CBl8qAEHYPX7I0ZDTXujnysJ7QHJw-Tpj8LffG9QxkSJUK25xWoA7DCt4VEc8IbA7zDbVx1bfbd2WB93D9esTtGjadK787o9gplVEHy3Fa9VTtvSTnFNNV_co_MuekpRRyOCo4cO29fOqbAI95YmvJZVwovvl4kz3VQvL5K57VPkWRMMGGGX4X-z6-FlwziSCt_pUr6rA");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
    if(!destinationsReady){
    try {
      const response = await fetch(`https://map.ir/search/v2/autocomplete?text=${hospital}select=nearby&%24filter=province eq تهران&lat=${location.coords.latitude}&lon=${location.coords.longitude}`, requestOptions)
      const result = await response.json();
      return result.value[0];
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  }

  // create mrkers based on neshan response
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

  const fetchAndCreateMarkers = async () => {

    // Run all requests in parallel
    console.log('promise running')
    
    const results = await Promise.all(
      insuranceData.map(item => findLocation(item.name))
    );
    // Filter out null/duplicates
    const newDestinations = await results
      .filter(item => item !== null)
      .filter((item, index, self) =>
        self.findIndex(i => i.title === item.title) === index
      );
    // Update state once with all unique items
    setDestination(newDestinations);

    // Now call markerCreator

  };


  // waiter for neshan api and caller for marker
  useEffect(() => {
    console.log('destinations runner')

    if (location && !destinationsReady) {
      setDestinationReady(true)

      fetchAndCreateMarkers();
    }
  }, [insuranceData, location]);

  useEffect(() => {
    console.log('marker running')
    if (destinations.length > 0) {
      markerCreator(); // Runs AFTER state updates
    }
  }, [destinations, location]);


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

          {markers}

        </MapView>
      ) : null}
      <Text>{text}</Text>
    </View>
  );
};

export default MyLocationComponent;