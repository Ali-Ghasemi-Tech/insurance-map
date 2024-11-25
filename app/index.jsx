import { StyleSheet,Text, View , Button } from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";

import React, { Component, Fragment , usestate } from 'react';

var items = [
  {
    id:0,
    name:'هیچکدام',
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
    id: 3,
    name: 'نیروهای مسلح',
  },
  {
    id: 4,
    name: 'کمیته امداد امام خمینی (ره)',
  },
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
    id: 13,
    name: 'کوثر',
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
];
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectItem:
        {
          id: 0,
          name: 'هیچکدام',
        },
      
    }
  }
  render() {
  return (
        <Fragment>
          <Text style={styles.header}>با انتخاب بیمه ای که داری میتونی بیمارستانایی که نزدیکتن و بیمه تو هم پوشش میدن پیدا کنی</Text>
          <View style={styles.container}>
          <SearchableDropdown
            onItemSelect={(item) => {
              let items = this.state.selectItem;
              items = item
              this.setState({ selectItem: items });
            }}
            containerStyle={{ padding: 5 }}
            onRemoveItem={(item, index) => {
              const items = this.state.selectItem.filter((sitem) => sitem.id !== item.id);
              this.setState({ selectItem: items });
            }}
            itemStyle={{
              padding: 10,
              marginTop: 2,
              backgroundColor: '#ddd',
              borderColor: '#bbb',
              borderWidth: 1,
              borderRadius: 5,
            }}
            itemTextStyle={{ color: '#222'  , direction: 'rtl'}}
            itemsContainerStyle={{ maxHeight: 140 }}
            items={items}
            defaultIndex={2}
            resetValue={false}
            textInputProps={
              {
                placeholder: this.state.selectItem.name,
                underlineColorAndroid: "transparent",
                style: {
                    direction: 'rtl',
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 5,
                },
              }
            }
            listProps={
              {
                nestedScrollEnabled: true,
              }
            }
        />

        <Button title="جستجو" onPress={() => handleApi(this.state.selectItem.id)}/>
        </View>
      </Fragment>
  );
  }
}

const handleApi = (id)=>{
  console.log(id)
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  header:{
    fontSize: 20,
    direction: 'rtl'
  }

  
});

export default App