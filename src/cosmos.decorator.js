/**
 * Декорация для react-cosmos (не учавствует в production-сборке приложения)
 */

import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import { HashRouter as Router } from 'react-router-dom';
import configureStore from '@/redux/configureStore';

export default ({ children }) => (
  <ReduxMock configureStore={configureStore}>
    <Router>{children}</Router>
  </ReduxMock>
);
