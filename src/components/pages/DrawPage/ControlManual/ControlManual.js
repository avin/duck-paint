import React from 'react';
import { useSelector } from 'react-redux';
import styles from './styles.module.scss';
import { ReactComponent as HelpIcon } from './icons/question.svg';

const ControlManual = () => {
  const mode = useSelector(state => state.uiSettings.mode);

  return (
    <div className={styles.container}>
      {mode === 'DRIVE' && (
        <>
          Control:<b>A</b> - Turn left; <b>D</b> - Turn right; <b>W</b> - Speed up; <b>Tab</b> -
          Change camera
        </>
      )}

      {mode === 'FREE' && (
        <>
          <HelpIcon className={styles.icon} /> Control: <b>Left mouse + move</b> - Draw;{' '}
          <b>Middle mouse + move</b> - Rotate
        </>
      )}
    </div>
  );
};

ControlManual.protoTypes = {};

export default ControlManual;
