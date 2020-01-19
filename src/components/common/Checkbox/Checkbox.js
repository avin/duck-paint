import React, { useCallback } from 'react';
import cn from 'clsx';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import styles from './styles.module.scss';

const Checkbox = ({
  className,
  id,
  children,
  value,
  disabled,
  defaultValue,
  onChange = noop,
  inputProps = {},
}) => {
  const handleChange = useCallback(
    e => {
      onChange(e.currentTarget.checked);
    },
    [onChange],
  );

  return (
    <div className={cn(styles.container, className)}>
      <input
        {...inputProps}
        type="checkbox"
        id={id}
        className={cn(styles.input, inputProps.className)}
        checked={value}
        defaultChecked={defaultValue}
        onChange={handleChange}
        disabled={disabled}
      />
      <label htmlFor={id} className={styles.label}>
        {children}
      </label>
    </div>
  );
};

Checkbox.propTypes = {
  /** ID требуется обазытельно указать для нормальной работы */
  id: PropTypes.string.isRequired,
  /** Свойства для вложенного input */
  inputProps: PropTypes.object,
};

export default Checkbox;
