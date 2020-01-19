import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const FormContainer = ({ blocked, children }) => {
  return (
    <div className={styles.formContainer}>
      {blocked && <div className={styles.formBlocker} />}
      {children}
    </div>
  );
};
FormContainer.protoTypes = {
  /** Форма заблокирована */
  blocked: PropTypes.bool,
};

export default FormContainer;
