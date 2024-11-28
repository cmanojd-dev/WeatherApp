import {combineReducers} from 'redux';
import params from './params';
import tempReducer from './temperatureReducer';

const rootReducer = combineReducers({
  // navigation: navigation,
  params,
  temperatureReducer: tempReducer,
});

export default rootReducer;
