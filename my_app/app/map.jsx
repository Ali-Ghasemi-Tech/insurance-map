import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TurboModuleRegistry } from 'react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';





const MyLocationComponent = () => {
  const { searchValue, searchId, searchCity, cityCoords, facility } = useLocalSearchParams();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destinations, setDestination] = useState([])
  const [markers, setMarkers] = useState([])
  const [destinationsReady, setDestinationReady] = useState(false)
  const [firstRunDone, setFristRunDone] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [html, sethtml] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isLocationEnabled, setIsLocationEnabled] = useState(null)

  const webviewRef = useRef(null);
  const router = useRouter();

  const coords = JSON.parse(cityCoords);



  // user location
  if (!coords) {
    useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          setLocation(location);
        } catch (error) {
          setErrorMsg('Error getting location: ' + error.message);
        }
        setIsLocationEnabled(await Location.hasServicesEnabledAsync());
        if (!isLocationEnabled) {
          setIsLoading(false)
        }
      })();
    }, []);
  }

  // handle django api
  useEffect(() => {
    const handleApi = async () => {
      console.log('start')

      try {
        let request = `https://insurance-map-backend1.liara.run/hospital-locations?insurance_name=${searchValue.trim()}&lat=${location ? location.coords?.latitude : null}&lng=${location ? location.coords?.longitude : null}&selected_city=${searchCity}&selected_class=${facility}`
        

        if (coords) {
          request = `https://insurance-map-backend1.liara.run/hospital-locations?insurance_name=${searchValue.trim()}&lat=${coords?.lat}&lng=${coords?.lng}&selected_city=${searchCity}&selected_class=${facility}`
        }
        console.log(request)
        console.log('django running')
        const response = await fetch(request, {
          method: "GET",
          redirect: "follow",
        });

        var data = null
        try {
          data = await response.json();
        } catch {
          data = null
        }
        console.log(data)
        if (!response.ok) {
          if (data == null) {
            setErrorMsg('سرور ها خاموش هستند ل طفا صبور باشید.')
            return
          }
          setErrorMsg(data['error'])
          return
        }
        if (data['locations'] == 0){
          setErrorMsg('موقعیت مکانی مرکز درمانی مورد نظر به درستی پیدا نشد لطفا دوباره تلاش کنید')
        }
        setDestination(data.locations);
        console.log('api ready')
        setDestinationReady(true)
        
      }
      catch (e) {
        console.error(e.message)
        setErrorMsg(e.message)
      }

    }

    setFristRunDone(true)

    if (!destinationsReady && firstRunDone && location || coords) {
      handleApi();
      setIsLoading(false)

    }

  }, [location, firstRunDone]);

  useEffect(() => {
    if (errorMsg) {
      setShowModal(true)
    }
  }, [errorMsg])
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
    setIsLoading(false)
    setMarkers(newMarkers)

  }


  useEffect(() => {
    console.log('marker running')
    if (destinations.length > 0) {
      markerCreator(); // Runs AFTER state updates
    }
  }, [destinationsReady]);

  useEffect(() => {
    if (destinationsReady && !isLoading) {
      webviewRef.current?.injectJavaScript(`
        document.getElementById("loading-overlay").style.display = "none";
        true;
      `);
    }
  }, [isLoading, destinationsReady]);
  useEffect(() => {
    sethtml(`
    <!DOCTYPE html>
    <html lang= "fa">
      <head>
        <title>Leaflet OSM Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
            position: relative;
          }
          .user-location-icon {
          background-color:rgb(55, 183, 237); /* User location color (Green) */
          border-radius: 50%; 
          width: 10px;
          height: 10px;
          border: 2px solid white; 
        }
        .insurance_name {
          font-family: 'Segoe UI', Tahoma, sans-serif;
          text-align: right;
          position: absolute; 
          top: 10px; 
          right: 10px; 
          z-index: 1000; 
          background: #4248fc; 
          color: white;
          padding: 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          width: 75%

      
        }
        .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .modal-content {
        background:rgb(89, 95, 251);
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        color: white;
      }
      .modal-button {
        color: rgb(31, 31, 31);
        background: white;
        border: 0;
        border-radius: 5px
      }

      
        </style>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      </head>
      <body>
        <div id="map">

          <div class= "insurance_name"> درحال جستجوی ${facility} های تحت پوشش بیمه ${searchValue} در ${searchCity} . </div>
           ${showModal ? `
      <div class="overlay">
        <div class="modal-content">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAY9JREFUSEvFVe1tg0AMfagBqVM0mSQwSc0kbSfBm0AnSbeolDQiZ3JG5uPuUNWo/EHojJ/f8zs7w4Of7MH5kQS4EJUAjgDkXfbAl3t32f39mTN3sSKDAN9E+x3Q+MTBHAJ4BapnZgFcPKsAF6I3F/ku0ZIgA1irFeAnoMyAF3dG7myvMTnzxxxhAWCTC8jaT5rEs3zVYtbiJwD+h5NPUKX0VSDfp9Yzqe1/E4ALUes1X63cseslqWMVZC4gBfNBwcfAM5Ho2cwDrKYxAN+bVnri+jWyHwGM9kHdYwBSyFoOy6Bx3hYN6oJZXLN4NgDIXRGZu5y5kgQW4CT0foBDyNMpADWJlflPAbxMEyPYHqiDgvZMMTBG4YK5nki0pcmpwRhtsr0s1sdbberlGVSwRhklssOtB0aKWwHORIMLrYMmEsmHHRUxu86lUvZrI2Zx5bVRPjg67GaXSz4X8QuA+YTUBSPj+goMy2V3HwdHHdexYv5n4czmvSyUoWLdbn5dCpvfr8yU57eeJ5f+1kShuBtRyfkZW7XhSwAAAABJRU5ErkJggg=="/>
          <p>.${errorMsg}</p>
          <button class= "modal-button" onclick="window.ReactNativeWebView.postMessage('navigate_back')">بازگشت</button>
        </div>
        
      </div>
      ` : ''}
        
        </div>
        <script>
          var markerList = ${JSON.stringify(markers)};
          var userLat = ${location ? location.coords.latitude : 'null'};
          var userLng = ${location ? location.coords.longitude : 'null'};
          var cityLat = ${coords ? coords.lat : 'null'};
          var cityLng = ${coords ? coords.lng : 'null'};

          var lat = cityLat !== null ? cityLat : userLat;
          var lng = cityLng !== null ? cityLng : userLng;
          


          var map = L.map('map').setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 16,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

          
         

          var bounds = [];

          
          markerList.forEach((marker) => {
            var popupContent = 
            "<div style= 'text-align: right;'>"+
              "<b>" + marker.title + "</b><br>" + marker.description + "<br>" +
              "<a href='geo:" + marker.lat + "," + marker.lng + "?q=" + encodeURIComponent(marker.title) + "' target='_blank' style='display:inline-block; margin:4px 0; padding:6px 12px; background-color:#007BFF; color:#fff; text-decoration:none; font-weight:bold; border-radius:5px;'>📍 باز کردن نقشه</a><br>";
            +"</div>"+
              

            L.marker([marker.lat, marker.lng])
              .addTo(map)
              .bindPopup(popupContent);

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
          bounds.add([userLat, userLng]);
        }

          if (bounds.length > 0) {
            map.fitBounds(bounds);
          }
        
        </script>
      </body>
    </html>
    `);
  }, [location, destinations, markers ,  isLoading, showModal])

  

  return (

    <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignContent: 'center' }}>
      {isLoading ? <ActivityIndicator size="large" /> :
        !coords && !location ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>برای پیدا کردن مراکز درمانی اطراف شما باید GPS خود را روشن کنید</Text></View> : <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled={true}
          style={{ flex: 1, position: 'relative' }}
          onMessage={(event) => {
            const { data } = event.nativeEvent;

            if (data === 'navigate_back') {
              // Navigate back to index
              router.back(); // or router.replace('/index')
            }
          }}
        />}

    </View>
  );
};

export default MyLocationComponent;


