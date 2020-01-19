import { SET_UI_SETTINGS_VALUES, RESET_UI_SETTINGS } from './actionTypes';

/**
 * Выставить настройки UI
 * @param values
 * @returns {{values: *, type: string}}
 */
export function setUiSettingsValues(values) {
  return {
    type: SET_UI_SETTINGS_VALUES,
    values,
  };
}

/**
 * Сброить все настройки UI для текущей сессии
 * @returns {{type: string}}
 */
export function resetUiSettings() {
  return {
    type: RESET_UI_SETTINGS,
  };
}
