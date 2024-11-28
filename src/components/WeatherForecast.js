import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {COLORS} from '../Assets/theme/COLOR';
import {request_weather_data} from '../Redux/Actions/publicDataActions';
import {
  celciusToFahrenheit,
  findLocation,
  getWeatherIcon,
  requestLocationPermission,
} from '../utils';
import CityInfo from './CityInfo';
import CurrentWeather from './CurrentWeather';
import HourlyInfo from './HourlyInfo';
import {toggleTemperatureUnit} from '../Redux/Actions/temperatureSwitchActions';
import Geolocation from 'react-native-geolocation-service';
import {languages, mergedCities} from '../Assets/theme/appDataConfig';
import {Dropdown} from 'react-native-element-dropdown';
import DropDownPicker from './DropDownPicker';
import config from '../config';

const windowWidth = Dimensions.get('window').width;

const WeatherForecast = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [selectedState, setSelectedState] = useState('Gujarat');
  const [selectedDayDate, setSelectedDayDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const {weather_data, weather_loading} = useSelector(state => state.params);
  const isCelcius = useSelector(state => state.temperatureReducer?.isCelcius);
  const dispatch = useDispatch();
  const [isEnabled, setIsEnabled] = useState(isCelcius);
  const [location, setLocation] = useState({latitude: '', longitude: ''});
  const [isFocus, setIsFocus] = useState(false);
  const [language, setLanguage] = useState(languages?.[0]?.value);

  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    dispatch(toggleTemperatureUnit());
  };

  useEffect(() => {
    dispatch(request_weather_data({language, ...location, selectedCity}));
  }, [selectedCity, location, language]);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    const result = await requestLocationPermission();
    if (result) {
      Geolocation.getCurrentPosition(
        async position => {
          console.log(position);
          const {latitude, longitude} = position?.coords;
          if (latitude && longitude) {
            setLocation({latitude: latitude, longitude: longitude});
            try {
              const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=${config.LOCATION_API_KEY}&q=${latitude},${longitude}`,
              );
              const json = await response.json();
              setSelectedCity(json?.location?.name);
              setSelectedState(json?.location?.region);
            } catch (error) {
              console.error(error.message);
            }
            setLoading(false);
          }
        },
        error => {
          console.log(error.code, error.message);
          setLocation({latitude: '', longitude: ''});
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }
  };

  const renderCurrentWeatherCards = ({item}) => {
    const today = new Date();
    const cardDate = new Date(item?.datetime);

    let dateString = cardDate.toLocaleDateString();
    if (cardDate.getDate() === today.getDate()) {
      dateString = 'Today';
    } else if (cardDate.getDate() === today.getDate() + 1) {
      dateString = 'Tomorrow';
    }

    const weatherIcon = getWeatherIcon(item.conditions);

    return (
      <TouchableOpacity
        style={[
          styles.forecastCard,
          item.datetime === selectedDayDate
            ? {backgroundColor: COLORS.primary}
            : {},
        ]}
        onPress={() => {
          setSelectedDayDate(item.datetime);
        }}>
        <Text
          style={[
            styles.forecastDate,
            item.datetime === selectedDayDate
              ? {color: COLORS.light_shade}
              : {},
          ]}>
          {dateString}
        </Text>
        <View style={{alignItems: 'center'}}>
          <Image source={weatherIcon} style={styles.forecastCondition} />
        </View>
        <Text
          style={[
            styles.forecastTempText,
            item.datetime === selectedDayDate
              ? {color: COLORS.light_shade}
              : {},
          ]}>
          {!isCelcius
            ? `${item?.temp}°C`
            : `${celciusToFahrenheit(item?.temp)}°F`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHourlyInfo = ({item, index}) => {
    return <HourlyInfo data={item} />;
  };

  const getSelectedDateHours =
    weather_data?.days?.filter(a => a.datetime == selectedDayDate)?.[0]
      ?.hours || [];
  const getSelectedDay =
    weather_data?.days?.filter(a => a.datetime == selectedDayDate)?.[0] || [];

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <View>
      <CityInfo
        city={selectedCity}
        state={selectedState}
        setLocation={setLocation}
        setSelectedCity={setSelectedCity}
        setSelectedState={setSelectedState}
      />
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 24,
        }}>
        <Text style={[styles.switchText, {paddingRight: 8}]}>°Celcius</Text>
        <Switch
          trackColor={{false: COLORS.switchOff, true: COLORS.switchOn}}
          thumbColor={COLORS.switchThumb}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Text style={[styles.switchText, {paddingLeft: 8}]}>°Fahrenheit</Text>
      </View>
      <DropDownPicker
        language={language}
        setLanguage={setLanguage}
        isFocus={isFocus}
        setIsFocus={setIsFocus}
      />
      <ScrollView>
        {weather_loading ? (
          <ActivityIndicator size={'small'} color={COLORS.primary} />
        ) : (
          <>
            {weather_data && (
              <View style={styles.scrollFlat}>
                <FlatList
                  data={weather_data?.days}
                  renderItem={renderCurrentWeatherCards}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.datetime}
                  horizontal
                />
              </View>
            )}

            {getSelectedDay && (
              <CurrentWeather currentWeather={getSelectedDay} />
            )}

            <FlatList
              data={getSelectedDateHours}
              renderItem={renderHourlyInfo}
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.datetime}
              style={styles.list}
              contentContainerStyle={{alignItems: 'center'}}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  forecastContainer: {
    width: windowWidth * 0.9,
    alignSelf: 'center',
    marginTop: 12,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    color: COLORS.dark_shade,
  },
  selectCity: {
    padding: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    width: windowWidth * 0.9,
    alignSelf: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  selectCityText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  switchText: {
    fontSize: 18,
    color: COLORS.dark_shade,
    fontWeight: 'bold',
  },
  weatherCard: {
    margin: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: COLORS.dark_shade,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: COLORS.dark_shade,
  },

  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  forecastCard: {
    // width: (windowWidth * 0.4) / 2,
    height: (windowWidth * 0.65) / 2,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 40,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
    marginBottom: 8,
    marginTop: 8,
    marginHorizontal: 7,
    alignSelf: 'center',
  },
  forecastDate: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.primary,
  },
  forecastCondition: {width: 50, height: 60},

  forecastTempText: {
    color: COLORS.temp,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollFlat: {
    marginTop: 22,
    width: windowWidth,
    alignSelf: 'center',
    marginBottom: (windowWidth * 0.2) / 2,
    marginLeft: 14,
  },
  selectCityHeaderText: {color: COLORS.windSpeedText, fontStyle: 'italic'},
  list: {
    alignSelf: 'center',
    marginTop: 20,
    width: '100%',
    marginBottom: 70,
  },
});

export default WeatherForecast;
