import React from 'react';
import styles from './styles.module.scss';
import Spinner from '@/components/common/Spinner/Spinner';

const LoadingPage = () => {
  return (
    <div className={styles.loadingPage} data-testid="loading-page">
      <Spinner size={60} />
    </div>
  );
};

export default LoadingPage;
