import React, { useState } from 'react';
import Header from './Header/Header';
import styles from './styles.module.scss';
import LoadingPage from '@/components/common/LoadingPage/LoadingPage';

const MainLayout = ({ children }) => {
  const [isReady] = useState(true);

  if (!isReady) {
    return <LoadingPage />;
  }

  return (
    <div className={styles.mainLayout}>
      <Header className={styles.header} />

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default MainLayout;
