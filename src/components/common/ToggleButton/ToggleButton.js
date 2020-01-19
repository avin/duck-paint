import React, { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import styles from './styles.module.scss';

const ToggleButton = ({ label, id, checked, onChange = noop }) => {
  const idRef = useRef();

  useLayoutEffect(() => {
    idRef.current = id;
  }, [id]);

  const handleChange = e => {
    const { checked } = e.target;
    onChange(checked);
  };

  return (
    <label htmlFor={idRef.current} className={styles.checkbox}>
      <input
        type="checkbox"
        id={idRef.current}
        className={styles.checkboxInput}
        checked={checked}
        onChange={handleChange}
      />
      <span className={styles.checkboxDecor} />
      {label && <span className={styles.checkboxLabel}>{label}</span>}
    </label>
  );
};

ToggleButton.protoTypes = {
  label: PropTypes.node,
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

export default ToggleButton;
