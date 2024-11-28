import {PermissionsAndroid} from 'react-native';
import {AppImages} from './Assets/Images';

import {isEmpty} from 'lodash';

export const getWeatherIcon = conditions => {
  switch (conditions) {
    case 'Clear':
      return AppImages.sun;
    case 'Rain':
      return AppImages.umbrella;
    case 'Partially Cloud':
      return AppImages.sunSlowRain;
    default:
      return AppImages.start;
  }
};

export const celciusToFahrenheit = celsius => {
  if (celsius) {
    return ((celsius * 9) / 5 + 32)?.toFixed(1);
  }
};

export const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Geolocation Permission',
        message: 'Can we access your location?',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === 'granted') {
      console.log('You can use Geolocation');
      return true;
    } else {
      console.log('You cannot use Geolocation');
      return false;
    }
  } catch (err) {
    return false;
  }
};

// if (hasLocationPermission) {
//   Geolocation.getCurrentPosition(
//     position => {
//       console.log(position);
//     },
//     error => {
//       // See error code charts below.
//       console.log(error.code, error.message);
//     },
//     {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
//   );
// }
