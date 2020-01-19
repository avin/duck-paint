import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import styles from './styles.module.scss';
import ControlPanel from '@/components/pages/DrawPage/ControlPanel/ControlPanel';
import LoadingPage from '@/components/common/LoadingPage/LoadingPage';
import MainScene from '@/components/pages/DrawPage/graphics/MainScene';
import { useKeyPressHandler, useWindowFocus } from '@/utils/hooks';
import MobileControlHelper from './MobileControlHelper/MobileControlHelper';
import ControlHint from './ControlHint/ControlHint';

const DrawPage = () => {
  const [isReady, setIsReady] = useState(false);

  const canvasRef = useRef(null);
  const mainSceneRef = useRef(null);
  const engineRef = useRef(null);

  const [gamePaused, setGamePaused] = useState(true);

  const mode = useSelector(state => state.uiSettings.mode);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;

    if (mode === 'DRIVE') {
      setGamePaused(true);
    } else if (mode === 'FREE') {
      setGamePaused(false);
    }
  }, [mode]);

  useEffect(() => {
    (async () => {
      const canvas = canvasRef.current;

      // Инициализировать движок
      const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });
      engineRef.current = engine;

      // Создаем главную сцену
      const mainScene = new MainScene({
        engine,
        canvas,
      });
      mainSceneRef.current = mainScene;
      await mainScene.init();

      setIsReady(true);

      engine.runRenderLoop(() => {
        if (!mainScene.isStopped) {
          mainScene.render();
        }
      });
    })();

    const handleWindowResize = () => {
      engineRef.current.resize();
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      engineRef.current.dispose();
      window.removeEventListener('resize', handleWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    mainSceneRef.current.setPlayMode(mode);
  }, [mode, isReady]);

  const tabIsFocused = useWindowFocus();
  useEffect(() => {
    if (!tabIsFocused) {
      setGamePaused(true);
    }
  }, [tabIsFocused]);

  const keyPressHandler = useCallback(
    e => {
      if (e.key === 'Space' || e.which === 32 || e.key === 'Escape' || e.which === 27) {
        setGamePaused(!gamePaused);
      }
      if (e.key === 'Tab' || e.which === 9) {
        // Отключаем TAB
        e.preventDefault();

        mainSceneRef.current.changeDriveCameraMode();
      }
    },
    [gamePaused],
  );
  useKeyPressHandler(keyPressHandler);

  // При нажатии на паузу - снимаем с паузы
  const handleClickPauseMessage = useCallback(() => {
    setGamePaused(false);
  }, [setGamePaused]);

  useEffect(() => {
    // Дергаем метод сцены для остановки/запуска движения
    mainSceneRef.current.pause(gamePaused);
  }, [gamePaused]);

  useEffect(() => {
    // При смене режима всегда фокус на канвас
    canvasRef.current.focus();
  }, [gamePaused, mode]);

  const controlPanelIsOpen = useSelector(state => state.uiSettings.controlPanelIsOpen);

  return (
    <div className={styles.page}>
      {!isReady && (
        <div className={styles.loadingOverlay}>
          <LoadingPage />
        </div>
      )}
      <canvas ref={canvasRef} className={styles.mainCanvas} tabIndex="0" />
      <ControlPanel isOpen={controlPanelIsOpen} />

      {mode === 'DRIVE' && window.isMobile && <MobileControlHelper mainSceneRef={mainSceneRef} />}

      {gamePaused && mode === 'DRIVE' && (
        <div className={styles.pauseMessage} role="presentation" onClick={handleClickPauseMessage}>
          <div className={styles.content}>
            {window.isMobile ? 'Tap to start' : 'Press SPACE to start'}
          </div>
        </div>
      )}

      {!window.isMobile && <ControlHint />}
    </div>
  );
};

DrawPage.protoTypes = {};

export default DrawPage;
