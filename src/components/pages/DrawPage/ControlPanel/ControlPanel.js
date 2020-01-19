import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import cn from 'clsx';
import styles from './styles.module.scss';
import { setUiSettingsValues } from '@/redux/modules/uiSettings/actions';
import OpenControl from './OpenControl/OpenControl';

const ControlPanel = ({ isOpen }) => {
  const dispatch = useDispatch();

  const handleTogglePanel = useCallback(() => {
    dispatch(setUiSettingsValues({ controlPanelIsOpen: !isOpen }));
  }, [isOpen, dispatch]);

  return (
    <div className={cn(styles.controlPanel, { [styles.isOpen]: isOpen })}>
      ControlPanel here
      <OpenControl className={styles.openControl} isOpen={isOpen} onClick={handleTogglePanel} />
    </div>
  );
};
ControlPanel.protoTypes = {
  isOpen: PropTypes.bool,
};

export default ControlPanel;
