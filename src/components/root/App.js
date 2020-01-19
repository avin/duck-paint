import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout/MainLayout';
import DrawPage from '@/components/pages/DrawPage/DrawPage';

const App = () => {
  return (
    <Router>
      <MainLayout>
        <Switch>
          {/* Основная страница */}
          <Route exact path="/" component={DrawPage} />

          {/* Всё остальное - редиректим на основную */}
          <Redirect to="/" />
        </Switch>
      </MainLayout>
    </Router>
  );
};

export default App;
