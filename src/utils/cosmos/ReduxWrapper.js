import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import configureStore from '@/redux/configureStore';

const ReduxWrapper = ({ children, initialState }) => (
  <ReduxMock configureStore={configureStore} initialState={initialState}>
    {children}
  </ReduxMock>
);

export default ReduxWrapper;
