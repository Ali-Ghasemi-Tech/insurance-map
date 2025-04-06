import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';




const MyLocationComponent = () => {
  const { searchValue, searchId, searchCity } = useLocalSearchParams();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destinations, setDestination] = useState([])
  const [markers, setMarkers] = useState([])
  const [destinationsReady, setDestinationReady] = useState(false)
  const [firstRunDone, setFristRunDone] = useState(false)
  const [isLoading, setIsLoading] = useState(true);

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Leaflet OSM Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map').setView([37.78825, -122.4324], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      var marker = L.marker([37.78825, -122.4324]).addTo(map);

      marker.bindPopup("<b>Hello!</b><br>This is San Francisco.").openPopup();
    </script>
  </body>
</html>
`;


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
        const response = await fetch(`https://insurance.liara.run/api/?insurance_name=${searchValue.trim()}&lat=${location ? location.coords.latitude : 35.700264661345145}&lng=${location ? location.coords.longitude : 51.337807322871065}`, {
          method: "GET",
          redirect: "follow",
          android: { useCleartextTraffic: true },
        });
        if (!response.ok) {
          throw new Error('مشکلی برای سرور پیش آمده لطفا مشکل را گزارش دهید')
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
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{flex:1}}
      />
    </View>
  );
};

export default MyLocationComponent;


