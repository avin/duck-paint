import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cn from 'clsx';
import noop from 'lodash/noop';
import styles from './styles.module.scss';

const Input = ({
  className,
  innerRef = null,
  invalid = false,
  onClick = noop,
  selectOnClick,
  selectOnFocus,
  rightContentSize = 20,
  rightContent,
  leftContentSize = 20,
  leftContent,
  ...props
}) => {
  const handleClick = useCallback(
    e => {
      if (selectOnClick) {
        e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
      }

      onClick(e);
    },
    [selectOnClick, onClick],
  );

  const handleFocus = useCallback(
    e => {
      if (selectOnFocus) {
        e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
      }
    },
    [selectOnFocus],
  );

  return (
    <div className={styles.container}>
      <input
        ref={innerRef}
        className={cn(styles.input, { [styles.invalid]: invalid }, className)}
        {...props}
        onClick={handleClick}
        onFocus={handleFocus}
        style={{
          paddingRight: rightContent && rightContentSize,
          paddingLeft: leftContent && leftContentSize,
        }}
      />
      <div className={styles.rightContent}>{rightContent}</div>
      <div className={styles.leftContent}>{leftContent}</div>
    </div>
  );
};

Input.protoTypes = {
  /** Подсветить инпут как невалидно заполненный */
  invalid: PropTypes.bool,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.elementType }),
  ]),
  onClick: PropTypes.func,
  /** Выбирать всё содержимое при фокусе */
  selectOnClick: PropTypes.bool,
  selectOnFocus: PropTypes.bool,
  rightContent: PropTypes.node,
  rightContentSize: PropTypes.number,
  leftContent: PropTypes.node,
  leftContentSize: PropTypes.number,
};

export default Input;
