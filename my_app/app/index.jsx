import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  UIManager,
  findNodeHandle,
} from "react-native";
// import { FlatList , gestureHandlerRootHOC, GestureHandlerRootView } from "react-native-gesture-handler";
import SearchableDropdown from "./searchableDropdown";
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useRef } from "react";
import { Link } from 'expo-router';



import React, { Component, Fragment } from 'react';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
var not_in_db = [
  {
    id: 0,
    name: 'هیچکدام',
  },
  {
    id: 1,
    name: 'سلامت ایران',
  },
  {
    id: 2,
    name: 'تأمین اجتماعی',
  },
  {
    id: 4,
    name: 'کمیته امداد امام خمینی (ره)',
  },
  {
    id: 8,
    name: 'دی',
  },
  {
    id: 9,
    name: 'سامان',
  },
  {
    id: 10,
    name: 'دانا',
  },
  {
    id: 11,
    name: 'پارسیان',
  },
  {
    id: 12,
    name: 'رازی',
  },
  {
    id: 14,
    name: 'سرمد',
  },
  {
    id: 15,
    name: 'تعاون',
  },
  {
    id: 16,
    name: 'پاسارگاد',
  },
]

var items = [
  {
    id: 5,
    name: ' ایران',
  },
  {
    id: 6,
    name: 'آسیا',
  },
  {
    id: 7,
    name: 'البرز',
  },
  {
    id: 13,
    name: 'کوثر',
  },

  {
    id: 3,
    name: 'نیروهای مسلح',
  },

];

var city = [
  { id: 0, name: 'مکان فعلی من', coords: null },
  { id: 1, name: 'تهران', coords: { lat: 35.700264661345145, lng: 51.337807322871065 } },
  { id: 2, name: 'کرج', coords: { lat: 35.82928694170145, lng: 50.96736705072482 } },
  { id: 3, name: 'مشهد', coords: { lat: 36.297927914911895, lng: 59.60590934522712 } },
  { id: 4, name: 'شیراز', coords: { lat: 29.609164769331223, lng: 52.5320795545391 } },
  { id: 5, name: 'اصفهان', coords: { lat: 32.65528067364776, lng: 51.67512579396133 } },
]



function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectCity, setSelectedCity] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);
  const insuranceDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  const handleScrollToElement = (ref) => {
    if (ref.current && flatListRef.current) {
      const scrollResponder = flatListRef.current.getScrollResponder();

      // Get native component handle
      const nativeComponent = findNodeHandle(ref.current);

      UIManager.measureLayout(
        nativeComponent,
        findNodeHandle(flatListRef.current),
        (error) => console.error('Error:', error),
        (x, y) => {
          scrollResponder.scrollTo({
            y: y - 40,  // Adjust offset as needed
            animated: true
          });
        }
      );
    }
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F0F4F8',
      paddingHorizontal: 20,
    },
    headerContainer: {
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      textAlign: 'right',
      paddingTop: 40
    },
    headerText: {
      fontSize: 20,
      color: '#2D3748',
      textAlign: 'justify',
      lineHeight: 30,
      fontWeight: '600',
      direction: 'ltr'
    },
    dropdownTitle: {
      fontSize: 10,
      color: '#2D3748',
      textAlign: 'right',
      lineHeight: 30,
      fontWeight: '600',
    },
    dropdownContainer: {
      marginTop: 40,
    },
    dropdownInput: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      fontSize: 16,
      color: '#2D3748',
    },
    dropdownItem: {
      padding: 16,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
    },
    buttonDisabled: {
      backgroundColor: '#d3d3d3',  // Grayed out background for the disabled button
      marginTop: 24,
    },
    buttonTextDisabled: {
      backgroundColor: '#d3d3d3',
      color: '#aaa',  // Grayed out text color
      marginTop: 0
    },
    disabledText:{
      color: 'red',
      textAlign: 'right',
      marginTop : 24
    },
    buttonText: {
      backgroundColor: '#4248fc', // More vibrant green
      borderRadius: 12,
      height: 56, // Fixed height
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      elevation: 3,
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
  });

  return (
    // <KeyboardAvoidingView
    //   style={{ flex: 1 }}
    //   behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    //   keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 64}
    // >
    //   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    //     <View style={[styles.container, { paddingBottom: keyboardHeight || 160 }]}>
    //       <View style={styles.headerContainer}>
    //         <Text style={styles.headerText}>
    //           با انتخاب بیمه ای که داری میتونی بیمارستانایی که نزدیکتن و بیمه تو هم پوشش میدن پیدا کنی
    //         </Text>
    //       </View>
    //       {/* select insurance */}
    //       <View style={{gap : 15 , marginTop: 40}}>
    //         <View >
    //           <Text style={styles.dropdownTitle}>نام بیمه</Text>
    //           <SearchableDropdown
    //             onItemSelect={setSelectedItem}
    //             items={items}
    //             defaultIndex={0}
    //             resetValue={false}
    //             itemStyle={styles.dropdownItem}
    //             itemTextStyle={{
    //               color: '#2D3748',
    //               textAlign: 'right',
    //               fontSize: 16,
    //             }}
    //             itemsContainerStyle={{
    //               backgroundColor: 'white',
    //               borderRadius: 12,
    //               marginTop: 8,
    //               maxHeight: 200,
    //             }}
    //             textInputProps={{
    //               placeholder: selectedItem.name,
    //               style: styles.dropdownInput,
    //               placeholderTextColor: '#718096',
    //               underlineColorAndroid: 'transparent',
    //             }}
    //           />


    //         </View>
    //         {/* select location */}
    //         <View>
    //           <Text style={styles.dropdownTitle}>نام شهر (درصورت استفاده از GPS گزینه ای انتخاب نکنید)</Text>
    //           <SearchableDropdown
    //             onItemSelect={setSelectedCity}
    //             items={city}
    //             defaultIndex={0}
    //             resetValue={false}
    //             itemStyle={styles.dropdownItem}
    //             itemTextStyle={{
    //               color: '#2D3748',
    //               textAlign: 'right',
    //               fontSize: 16,
    //             }}
    //             itemsContainerStyle={{
    //               backgroundColor: 'white',
    //               borderRadius: 12,
    //               marginTop: 8,
    //               maxHeight: 200,
    //             }}
    //             textInputProps={{
    //               placeholder: selectCity.name,
    //               style: styles.dropdownInput,
    //               placeholderTextColor: '#718096',
    //               underlineColorAndroid: 'transparent',
    //             }}
    //           />


    //         </View>
    //       </View>
    //       <Link
    //         href={{
    //           pathname: '/map',
    //           params: {
    //             searchValue: selectedItem.name,
    //             searchId: selectedItem.id,
    //             searchCity: selectCity.name,
    //             cityId: selectCity.id,
    //             cityCoords: JSON.stringify(selectCity.coords),
    //           }
    //         }}
    //         asChild
    //       >
    //         <Pressable
    //           style={({ pressed }) => [
    //             styles.button,
    //             pressed && styles.buttonPressed,
    //           ]}
    //         >
    //           <Text style={styles.buttonText}>جستجو</Text>
    //         </Pressable>
    //       </Link>
    //     </View>
    //   </TouchableWithoutFeedback>
    // </KeyboardAvoidingView>

    <View>
      <FlatList
        ref={flatListRef}
        data={[{}]} // Empty data array with a single item
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="none"
        nestedScrollEnabled={false}
        keyboardShouldPersistTaps="handled"
        renderItem={() => (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>
                با انتخاب بیمه ای که داری میتونی بیمارستانایی که نزدیکتن و بیمه تو هم پوشش میدن پیدا کنی
              </Text>
            </View>

            {/* Content Container */}
            <View style={{ gap: 15, marginTop: 40 }}>
              {/* Insurance Selection */}
              <View >
                <Text style={styles.dropdownTitle}>نام بیمه</Text>
                <SearchableDropdown

                  ref={insuranceDropdownRef}
                  onItemSelect={setSelectedItem}
                  items={items}
                  defaultIndex={0}
                  resetValue={false}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={{
                    color: '#2D3748',
                    textAlign: 'right',
                    fontSize: 16,
                  }}
                  itemsContainerStyle={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    marginTop: 8,
                    maxHeight: 200,
                  }}
                  textInputProps={{
                    placeholder: selectedItem != null ? selectedItem.name : 'بطور مثال: ایران، البرز ، نیروهای مسلح و ...',
                    style: styles.dropdownInput,
                    placeholderTextColor: '#718096',
                    underlineColorAndroid: 'transparent',
                    onPress: () => handleScrollToElement(insuranceDropdownRef)
                  }}
                />

              </View>

              {/* City Selection */}
              <View >
                <Text style={styles.dropdownTitle}>نام شهر (درصورت استفاده از GPS گزینه ای انتخاب نکنید)</Text>
                <SearchableDropdown
                  ref={cityDropdownRef}
                  onItemSelect={setSelectedCity}
                  items={city}
                  defaultIndex={0}
                  resetValue={false}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={{
                    color: '#2D3748',
                    textAlign: 'right',
                    fontSize: 16,
                  }}
                  itemsContainerStyle={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    marginTop: 8,
                    maxHeight: 200,
                  }}
                  textInputProps={{
                    placeholder: selectCity ? selectCity.name : 'بطور مثال: تهران، اصفحان و ...',
                    style: styles.dropdownInput,
                    placeholderTextColor: '#718096',
                    underlineColorAndroid: 'transparent',
                    onPress: () => handleScrollToElement(cityDropdownRef),

                  }}

                />
              </View>
            </View>

            {/* Search Button */}
            <Link
              href={{
                pathname: '/map',
                params: {
                  searchValue: selectedItem? selectedItem.name : null,
                  searchId: selectedItem ? selectedItem.id: null,
                  searchCity: selectCity? selectCity.name : city[0].name,
                  cityId:selectCity? selectCity.id: city[0].id,
                  cityCoords: selectCity? JSON.stringify(selectCity.coords): JSON.stringify(city[0].coords),
                }
              }}
              asChild
            >
              <Pressable
                disabled={!selectedItem}  // Disable the button if selectedItem is null
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  !selectedItem && styles.buttonDisabled,  // Apply grayed-out style when disabled
                ]}
              >
                {!selectedItem ? <Text style= {styles.disabledText}>برای جستجو یک بیمه انتخاب کنید</Text> : null}
                <Text style={[styles.buttonText, !selectedItem && styles.buttonTextDisabled]}>
                  جستجو
                </Text>
              </Pressable>
            </Link>
          </View>
        )}
      />
    </View>
  );
}

export default App;