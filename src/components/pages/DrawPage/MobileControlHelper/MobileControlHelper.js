import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const MobileControlHelper = ({ mainSceneRef }) => {
  // Up
  const handlePressUp = useCallback(() => {
    mainSceneRef.current.activeKeys.ArrowUp = true;
  }, [mainSceneRef]);
  const handleUnPressUp = useCallback(() => {
    mainSceneRef.current.activeKeys.ArrowUp = false;
  }, [mainSceneRef]);

  // Left
  const handlePressLeft = useCallback(() => {
    mainSceneRef.current.activeKeys.ArrowLeft = true;
  }, [mainSceneRef]);
  const handleUnPressLeft = useCallback(() => {
    mainSceneRef.current.activeKeys.ArrowLeft = false;
  }, [mainSceneRef]);

  // Right
  const handlePressRight = useCallback(() => {
    mainSceneRef.current.activeKeys.ArrowRight = true;
  }, [mainSceneRef]);
  const handleUnPressRight = useCallback(() => {
    mainSceneRef.current.activeKeys.ArrowRight = false;
  }, [mainSceneRef]);

  return (
    <div className={styles.container}>
      <div className={styles.topContent}>
        <div
          role="presentation"
          className={styles.button}
          onMouseDown={handlePressUp}
          onMouseUp={handleUnPressUp}
          onTouchStart={handlePressUp}
          onTouchEnd={handleUnPressUp}
        />
      </div>
      <div className={styles.bottomContent}>
        <div
          role="presentation"
          className={styles.button}
          onMouseDown={handlePressLeft}
          onMouseUp={handleUnPressLeft}
          onTouchStart={handlePressLeft}
          onTouchEnd={handleUnPressLeft}
        />
        <div
          role="presentation"
          className={styles.button}
          onMouseDown={handlePressRight}
          onMouseUp={handleUnPressRight}
          onTouchStart={handlePressRight}
          onTouchEnd={handleUnPressRight}
        />
      </div>
    </div>
  );
};

MobileControlHelper.protoTypes = {
  mainSceneRef: PropTypes.object,
};

export default MobileControlHelper;
