import React from 'react';
import PropTypes from 'prop-types';
import cn from 'clsx';
import styles from './styles.module.scss';

const ButtonsSelect = ({ options = [], onSelect, value: currentValue }) => {
  if (!options.length) {
    return null;
  }

  return (
    <div className={styles.buttonsGroup}>
      {options.map(({ value, label }) => {
        return (
          <button
            type="button"
            key={value}
            className={cn(styles.button, { [styles.active]: value === currentValue })}
            onClick={() => onSelect(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

ButtonsSelect.protoTypes = {
  options: PropTypes.array,
};

export default ButtonsSelect;
