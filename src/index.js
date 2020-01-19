import React from 'react';
import ReactDOM from 'react-dom';
import Root from './components/root/Root';
import './styles/index.scss';
import configureStore from './redux/configureStore';
import { prepareBrowserEnv } from '@/utils/browser';

const store = configureStore();

prepareBrowserEnv();

ReactDOM.render(<Root store={store} />, document.getElementById('root'));
