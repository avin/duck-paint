import React from 'react';
import cn from 'clsx';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import { ReactComponent as CogIcon } from './icons/cog.svg';
import styles from './styles.module.scss';

const OpenControl = ({ className, onClick = noop, isOpen }) => {
  return (
    <button
      type="button"
      className={cn(styles.openControl, className, { [styles.isOpen]: isOpen })}
      onClick={onClick}
    >
      <CogIcon className={cn(styles.icon)} />
    </button>
  );
};

OpenControl.protoTypes = {
  isOpen: PropTypes.bool,
};

export default OpenControl;
