const initialState = {
  isCelcius: false,
};

const tempReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_TEMPERATURE_UNIT':
      return {
        ...state,
        isCelcius: !state.isCelcius,
      };

    default:
      return state;
  }
};

export default tempReducer;
