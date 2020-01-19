import React from 'react';
import PropTypes from 'prop-types';
import cn from 'clsx';
import styles from './styles.module.scss';

const FormControl = ({
  label,
  children,
  htmlFor,
  className,
  labelClassName,
  inputContainerClassName,
}) => {
  return (
    <div className={cn(styles.formControl, className)}>
      {label && (
        <label htmlFor={htmlFor} className={cn(styles.label, labelClassName)}>
          {label}
        </label>
      )}
      <div className={cn(styles.inputContainer, inputContainerClassName)}>{children}</div>
    </div>
  );
};

FormControl.protoTypes = {
  label: PropTypes.node,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  inputContainerClassName: PropTypes.string,
};

export default FormControl;
