import { StyleSheet, Text, View, Pressable } from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { Link } from 'expo-router';



import React, { Component, Fragment } from 'react';

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
  {id: 0 , name:'مکان فعلی من', coords:{lat: 35.700264661345145, lng:51.337807322871065}},
  {id: 1 , name:'تهران' , coords:{lat: 35.700264661345145, lng:51.337807322871065}},
  {id: 2 , name:'کرج'  , coords:{lat: 35.82928694170145, lng:50.96736705072482}},
  {id: 3 , name:'مشهد'  , coords:{lat: 36.297927914911895, lng:59.60590934522712}},
  {id: 4 , name:'شیراز'  , coords:{lat: 29.609164769331223, lng:52.5320795545391}},
  {id: 5 , name:'اصفحان'  , coords:{lat: 32.65528067364776, lng:51.67512579396133}},
]



function App() {
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [selectCity , setSelectedCity] = useState(city[0])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F0F4F8',
      paddingHorizontal: 20,
    },
    headerContainer: {
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      paddingBottom: 24,
      marginTop: 40,
    },
    headerText: {
      fontSize: 20,
      color: '#2D3748',
      textAlign: 'right',
      lineHeight: 30,
      fontWeight: '600',
    },
    dropdownTitle:{
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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          با انتخاب بیمه ای که داری میتونی بیمارستانایی که نزدیکتن و بیمه تو هم پوشش میدن پیدا کنی
        </Text>
      </View>
      {/* select insurance */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownTitle}>نام بیمه</Text>
        <SearchableDropdown
          onItemSelect={setSelectedItem}
          items={items}
          defaultIndex={2}
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
            placeholder: selectedItem.name,
            style: styles.dropdownInput,
            placeholderTextColor: '#718096',
            underlineColorAndroid: 'transparent',
          }}
        />

        
      </View>
      {/* select location */}
      <View >
        <Text style={styles.dropdownTitle}>نام شهر (درصورت استفاده از GPS گزینه ای انتخاب نکنید)</Text>
        <SearchableDropdown
          onItemSelect={setSelectedCity}
          items={city}
          defaultIndex={2}
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
            placeholder: selectCity.name,
            style: styles.dropdownInput,
            placeholderTextColor: '#718096',
            underlineColorAndroid: 'transparent',
          }}
        />

        
      </View>
      <Link
          href={{
            pathname: '/map',
            params: {
              searchValue:selectedItem.name,
              searchId: selectedItem.id,
              searchCity: selectCity.name,
              cityId: selectCity.id,
              cityCoords : JSON.stringify(selectCity.coords),
            }
          }}
          asChild
        >
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>جستجو</Text>
          </Pressable>
        </Link>
    </View>
  );
}

export default App;