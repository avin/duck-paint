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

        // =================================
        // =================================
        // =================================

        const sphere = BABYLON.MeshBuilder.CreateSphere(
          'sphere',
          { diameter: 0.05, segments: 32 },
          scene,
        );
        sphere.material = new BABYLON.StandardMaterial('sphereMat', scene);
        sphere.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        sphere.material.alpha = 0.5;

        sphere.position.x = 0.1;

        // ---------------------------------

        // const xPoint = BABYLON.MeshBuilder.CreateSphere(
        //   'sphere',
        //   { diameter: 0.05, segments: 32 },
        //   scene,
        // );
        // xPoint.material = new BABYLON.StandardMaterial('xPointMat', scene);
        // xPoint.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        // ---------------------------------

        // const mesh = BABYLON.MeshBuilder.CreateGround('mesh', { width: 6, height: 6 }, scene);
        const mesh = BABYLON.MeshBuilder.CreateTorusKnot(
          'm',
          { radius: 2.0, tube: 0.6, radialSegments: 128, sideOrientation: BABYLON.Mesh.FRONTSIDE },
          scene,
        );
        mesh.material = new BABYLON.StandardMaterial('mat', scene);
        mesh.material.alpha = 0.1;
        mesh.material.backFaceCulling = false;

        mesh.partitioningSubdivisions = 50;
        mesh.updateFacetData();

        // showPartitioning(mesh, 5.0, scene);
        drawNormals(mesh, 0.05, scene);

        // ---------------------------------

        const initTime = Date.now();
        let time = 0;

        // ---------------------------------

        let lineF = BABYLON.MeshBuilder.CreateLines(
          'lineF',
          { points: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)], updatable: true },
          scene,
        );
        lineF.color = new BABYLON.Color3(0, 1, 0);

        // ---------------------------------

        let intersected = false;
        let lastNormal;
        let intersectPoint = BABYLON.Vector3.Zero();
        let lastAngle = 0;
        let direction = BABYLON.Vector3.Zero();

        let angle = -1.5;
        let ruleAngle = 0;

        scene.registerBeforeRender(params => {
          time = (Date.now() - initTime) * 0.001;

          if (!intersected) {
            sphere.position.y = Math.sin(time * 0.5) * 2.1;

            const index = mesh.getClosestFacetAtCoordinates(
              sphere.position.x,
              sphere.position.y,
              sphere.position.z,
              intersectPoint,
            );
            if (index !== null) {
              intersected = true;
              //direction = intersectPoint.subtract(sphere.position).normalize();
              direction = sphere.position.subtract(intersectPoint).normalize();
              sphere.position = intersectPoint;

              lastNormal = mesh.getFacetNormal(index);
            }
          } else {
            let f = BABYLON.Vector3.Zero();
            let fForLine = BABYLON.Vector3.Zero();
            let smallF = BABYLON.Vector3.Zero();

            const size = 0.2;

            angle += 0.1;

            let dst = BABYLON.Vector3.Zero();

            // -1.5 to 1.5
            const start = new BABYLON.Vector3(Math.tan(angle) * Math.PI * 2, Math.PI / 2, 0);

            // Рулить
            const xx = BABYLON.Vector3.Zero();
            direction.rotateByQuaternionToRef(
              BABYLON.Quaternion.FromEulerAngles(0, ruleAngle, 0),
              xx,
            );

            BABYLON.Vector3.CrossToRef(lastNormal, xx, f);
            BABYLON.Vector3.CrossToRef(f, start, f);

            f.normalizeToRef(f);

            fForLine = f.add(sphere.position);

            smallF = f.multiply(new BABYLON.Vector3(size)).add(sphere.position);

            // lastNormal.rotateByQuaternionToRef(
            //   BABYLON.Quaternion.FromEulerAngles(angle, 0, 0),
            //   dst,
            // );
            // let step = 0.05;
            // dst = dst.multiply(new BABYLON.Vector3(step, step, step)).add(intersectPoint);

            let newPosition = BABYLON.Vector3.Zero();
            const index = mesh.getClosestFacetAtCoordinates(
              smallF.x,
              smallF.y,
              smallF.z,
              newPosition,
              //true,
            );
            if (index !== null) {
              intersectPoint = newPosition;

              //direction = intersectPoint.subtract(sphere.position).normalize();
              direction = sphere.position.subtract(intersectPoint).normalize();
              sphere.position = intersectPoint;

              angle = -1.5;
              lastAngle = angle;
            }

            lineF = BABYLON.MeshBuilder.CreateLines('lines', {
              points: [sphere.position, fForLine],
              instance: lineF,
            });
          }

          freeCamera.setTarget(sphere.position);
        });

        scene.registerAfterRender(() => {
          if (angle > 1.5) {
            angle = -1.5;
            //ruleAngle+=.21
          }
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
