import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader';
import App from './App';

const Root = ({ store }) => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default hot(module)(Root);
