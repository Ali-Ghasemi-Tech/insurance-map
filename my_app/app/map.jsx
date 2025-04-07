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
  const [mapHtml, setMapHtml] = useState(null);


  


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
      {
        id: index,
        lat: item.geom.coordinates[1],
        lng: item.geom.coordinates[0],
        title: item.title,
        description: item.address
      }


    ));
    setMarkers(newMarkers)

  }


  useEffect(() => {
    console.log('marker running')
    if (destinations.length > 0) {
      markerCreator(); // Runs AFTER state updates
    }
  }, [destinationsReady]);

  
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
          .user-location-icon {
          background-color:rgb(55, 183, 237); /* User location color (Green) */
          border-radius: 50%; /* Make it circular */
          width: 10px;
          height: 10px;
          border: 2px solid white; /* Optional border around the marker */
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
          var map = L.map('map').setView([35.700264661345145, 51.337807322871065], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

          
          var markerList = ${JSON.stringify(markers)};

          
          var userLat = ${location?.coords?.latitude || null};
          var userLng = ${location?.coords?.longitude || null};

          var bounds = [];

          
          markerList.forEach((marker) => {
            L.marker([marker.lat, marker.lng])
              .addTo(map)
              .bindPopup("<b>" + marker.title + "</b><br>" + marker.description);
            bounds.push([marker.lat, marker.lng]);
          });

          if (userLat !== null && userLng !== null) {
          var userIcon = L.divIcon({
            className: 'user-location-icon',
            iconSize: [10, 10], // Size of the marker
            
            popupAnchor: [0, -20] // Position for the popup
          });

          L.marker([userLat, userLng], { icon: userIcon })
            .addTo(map)
            .bindPopup("<b>موقعیت شما</b>");
          bounds.push([userLat, userLng]);
        }

          if (bounds.length > 0) {
            map.fitBounds(bounds);
          }
        </script>
      </body>
    </html>
    `;
    console.log(html)
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


