import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import {languages} from '../Assets/theme/appDataConfig';
import {COLORS} from '../Assets/theme/COLOR';

const DropDownPicker = ({language, isFocus, setIsFocus, setLanguage}) => {
  const renderLabel = () => {
    if (language || isFocus) {
      return (
        <Text style={[styles.label, isFocus && {color: 'blue'}]}>
          Choose Language
        </Text>
      );
    }
    return null;
  };
  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={languages}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Choose Language' : '...'}
        value={language}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setLanguage(item.value);
          setIsFocus(false);
        }}
        itemTextStyle={styles.selectedTextStyle}
      />
    </View>
  );
};

export default DropDownPicker;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    width: '70%',
    alignSelf: 'center',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: COLORS.dark_shade,
  },
  placeholderStyle: {
    fontSize: 16,
    color: COLORS.dark_shade,
  },
  selectedTextStyle: {
    fontSize: 15,
    color: COLORS.dark_shade,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
