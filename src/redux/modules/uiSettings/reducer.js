import produce from 'immer';
import { SET_UI_SETTINGS_VALUES, RESET_UI_SETTINGS } from './actionTypes';

const initialState = {
  controlPanelIsOpen: false,

  mode: 'FREE' // FREE, DRIVE
};

export default function reducer(state = initialState, action = {}) {
  return produce(state, state => {
    switch (action.type) {
      case SET_UI_SETTINGS_VALUES: {
        const { values } = action;
        state = {
          ...state,
          ...values,
        };
        break;
      }
      case RESET_UI_SETTINGS: {
        state = initialState;
        break;
      }

      default:
    }

    return state;
  });
}
