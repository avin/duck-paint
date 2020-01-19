/* eslint-disable no-unused-vars,prefer-const */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import styles from './styles.module.scss';
// import { showNormals } from '@/utils/meshHelpers';
import ControlPanel from '@/components/pages/DrawPage/ControlPanel/ControlPanel';
import LoadingPage from '@/components/common/LoadingPage/LoadingPage';

const drawNormals = (mesh, size, scene) => {
  const positions = mesh.getFacetLocalPositions();
  const normals = mesh.getFacetLocalNormals();

  const lines = [];
  for (let i = 0; i < positions.length; i += 1) {
    const line = [
      positions[i],
      positions[i].add(normals[i].multiply(new BABYLON.Vector3(size, size, size))),
    ];
    lines.push(line);
  }
  const lineSystem = BABYLON.MeshBuilder.CreateLineSystem('ls', { lines }, scene);
  lineSystem.color = BABYLON.Color3.Green();
  lineSystem.alpha = 0.25;
};

const showPartitioning = (mesh, scaling, scene) => {
  if (!scaling) {
    scaling = 2.0 * mesh.partitioningBBoxRatio;
  }

  const octMat = new BABYLON.StandardMaterial('om', scene);
  octMat.alpha = 0.2;
  octMat.backFaceCulling = false;
  octMat.diffuseColor = BABYLON.Color3.Blue();
  octMat.specularColor = BABYLON.Color3.Black();
  const bInfo = mesh.getBoundingInfo();

  let plane;
  for (let x = 0; x <= mesh.partitioningSubdivisions; x += 1) {
    if (x === 0) {
      plane = BABYLON.MeshBuilder.CreatePlane('px0', {}, scene);
      plane.material = octMat;
    } else {
      plane = plane.clone(`px${x}`);
    }
    plane.position.x =
      (bInfo.minimum.x +
        (x * (bInfo.maximum.x - bInfo.minimum.x)) / mesh.partitioningSubdivisions) *
      mesh.partitioningBBoxRatio;
    plane.rotation.y = Math.PI / 2.0;
    plane.scaling.x = scaling * mesh.partitioningBBoxRatio;
    plane.scaling.y = scaling * mesh.partitioningBBoxRatio;
  }
  for (let y = 0; y <= mesh.partitioningSubdivisions; y += 1) {
    plane = plane.clone(`py${y}`);
    plane.position.x = 0.0;
    plane.position.y =
      (bInfo.minimum.y +
        (y * (bInfo.maximum.y - bInfo.minimum.y)) / mesh.partitioningSubdivisions) *
      mesh.partitioningBBoxRatio;
    plane.rotation.x = Math.PI / 2.0;
    plane.scaling.x = scaling * mesh.partitioningBBoxRatio;
    plane.scaling.y = scaling * mesh.partitioningBBoxRatio;
  }
};

const DrawPage = () => {
  const [isReady, setIsReady] = useState(false);

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const freeCameraRef = useRef(null);
  const followCameraRef = useRef(null);
  const cameraLightRef = useRef(null);

  const mode = useSelector(state => state.uiSettings.mode);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
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

      // Создать сцену
      const createScene = async () => {
        const scene = new BABYLON.Scene(engine);
        sceneRef.current = scene;

        scene.clearColor = BABYLON.Color3.FromHexString('#293742');

        // Добавляем главный свет
        const mainLight = new BABYLON.HemisphericLight('Hemi', new BABYLON.Vector3(0, 1, 0), scene);
        mainLight.intensity = 0.5;

        // Камера вращающаяся вокруг утки
        const freeCamera = new BABYLON.ArcRotateCamera(
          'free-camera',
          0,
          1.2,
          6,
          BABYLON.Vector3.Zero(),
          scene,
        );
        freeCameraRef.current = freeCamera;
        freeCamera.wheelPrecision = 50;
        freeCamera.lowerBetaLimit = null;
        freeCamera.upperBetaLimit = null;

        // Свет камеры
        const cameraLight = new BABYLON.PointLight(
          'camera-light',
          new BABYLON.Vector3.Zero(),
          scene,
        );
        cameraLightRef.current = cameraLight;
        cameraLight.intensity = 0.3;

        const ground = BABYLON.Mesh.CreateGround('ground', 3, 3, 2, scene);
        ground.material = new BABYLON.StandardMaterial('mat', scene);
        ground.material.alpha = 0.25;
        ground.material.backFaceCulling = false;

        // =================================
        // =================================
        // =================================

        const x = new BABYLON.Vector3(1, 0, 1);
        const n = new BABYLON.Vector3(0, 1, 0);

        const lineX = BABYLON.MeshBuilder.CreateLines(
          'lineX',
          { points: [new BABYLON.Vector3(0, 0, 0), x], updatable: true },
          scene,
        );
        lineX.color = new BABYLON.Color3(1, 0, 0);

        const lineN = BABYLON.MeshBuilder.CreateLines(
          'lineN',
          { points: [new BABYLON.Vector3(0, 0, 0), n], updatable: true },
          scene,
        );
        lineN.color = new BABYLON.Color3(1, 1, 1);

        // !!!!!!!!!!

        let lineF = BABYLON.MeshBuilder.CreateLines(
          'lineF',
          { points: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)], updatable: true },
          scene,
        );
        lineF.color = new BABYLON.Color3(0, 1, 0);

        // ---------------------------------

        const initTime = Date.now();
        let time = 0;

        // ---------------------------------

        scene.registerBeforeRender(params => {
          time = (Date.now() - initTime) * 0.001;

          // const g1 = BABYLON.Quaternion.FromEulerVector(x);
          // const g2 = BABYLON.Quaternion.FromEulerVector(n);
          // const f = BABYLON.Vector3.Zero();
          // x.rotateByQuaternionToRef(BABYLON.Quaternion.Slerp(g1, g2, Math.sin(time)), f);

          // -1.5 to 1.5
          const start = new BABYLON.Vector3(Math.tan(time) * Math.PI * 2, Math.PI / 2, 0);

          // Рулить
          const ruleAngle = 0;
          const xx = BABYLON.Vector3.Zero();
          x.rotateByQuaternionToRef(BABYLON.Quaternion.FromEulerAngles(0, ruleAngle, 0), xx);

          const f = BABYLON.Vector3.Zero();
          BABYLON.Vector3.CrossToRef(n, xx, f);
          BABYLON.Vector3.CrossToRef(f, start, f);

          lineF = BABYLON.MeshBuilder.CreateLines('lines', {
            points: [new BABYLON.Vector3(0, 0, 0), f.normalize()],
            instance: lineF,
          });
        });

        return scene;
      };

      // call the createScene function
      const scene = await createScene();
      setIsReady(true);

      // run the render loop
      engine.runRenderLoop(() => {
        scene.render();
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

    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const cameraLight = cameraLightRef.current;

    scene.activeCamera.detachControl(canvas);

    switch (mode) {
      case 'FREE': {
        scene.activeCamera = freeCameraRef.current;
        break;
      }
      case 'DRIVE': {
        scene.activeCamera = followCameraRef.current;
        break;
      }
      default:
    }

    scene.activeCamera.attachControl(canvas, true);

    cameraLight.position = scene.activeCamera.position;
  }, [mode, isReady]);

  const controlPanelIsOpen = useSelector(state => state.uiSettings.controlPanelIsOpen);

  return (
    <div className={styles.page}>
      {!isReady && (
        <div className={styles.loadingOverlay}>
          <LoadingPage />
        </div>
      )}
      <canvas ref={canvasRef} className={styles.mainCanvas} />
      <ControlPanel isOpen={controlPanelIsOpen} />
    </div>
  );
};

DrawPage.protoTypes = {};

export default DrawPage;
