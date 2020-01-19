import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import styles from './styles.module.scss';
// import { showNormals } from '@/utils/meshHelpers';
import ControlPanel from '@/components/pages/DrawPage/ControlPanel/ControlPanel';
import LoadingPage from '@/components/common/LoadingPage/LoadingPage';

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
          0.75,
          1.2,
          60,
          BABYLON.Vector3.Zero(),
          scene,
        );
        freeCameraRef.current = freeCamera;
        freeCamera.lowerBetaLimit = null;
        freeCamera.upperBetaLimit = null;

        // Камера следующая за кистью
        const followCamera = new BABYLON.FollowCamera(
          'follow-camera',
          new BABYLON.Vector3(0, 10, -10),
          scene,
        );
        followCameraRef.current = followCamera;

        followCamera.radius = 20;
        followCamera.heightOffset = 10;
        followCamera.lowerHeightOffsetLimit = 10;
        followCamera.upperHeightOffsetLimit = 10;
        followCamera.lowerRadiusLimit = 5;
        followCamera.upperRadiusLimit = 5;

        followCamera.cameraAcceleration = 0.05;
        followCamera.maxCameraSpeed = 10;

        // Свет камеры
        const cameraLight = new BABYLON.PointLight(
          'camera-light',
          new BABYLON.Vector3.Zero(),
          scene,
        );
        cameraLightRef.current = cameraLight;
        cameraLight.intensity = 0.3;

        // Фигура кисти
        const brush = BABYLON.Mesh.CreateCylinder('cylinder', 1, 1, 1, 6, 1, scene, false);
        // const brush = BABYLON.Mesh.CreateSphere('cylinder', 6, 0.5, scene);
        const brushMaterial = new BABYLON.StandardMaterial('brush-material', scene);
        brushMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        brushMaterial.alpha = 0.7;
        brush.material = brushMaterial;

        brush.rotationQuaternion = new BABYLON.Quaternion();
        brush.targetRotationQuaternion = brush.rotationQuaternion;
        brush.targetPosition = brush.position;

        const brushPlus = BABYLON.Mesh.CreateBox('cylinder', 0.5, scene);
        brushPlus.scaling = new BABYLON.Vector3(0.5, 1, 1.5);

        // Начальная позиция кисти - на спине утки
        brush.position = new BABYLON.Vector3(
          -6.223477418636669,
          4.193322954756397,
          0.13768080415772133,
        );

        // followCamera будет следовать за кистью
        followCamera.lockedTarget = brush;
        // followCamera.cameraDirection = brush.position;

        // Грузим модельку
        const { meshes } = await BABYLON.SceneLoader.ImportMeshAsync(
          null,
          '/static/assets/scenes/',
          'duck.obj',
          scene,
        );
        const duck = meshes[0];
        duck.updateFacetData();

        // const duck = BABYLON.Mesh.CreateSphere('sphere', 10, 1, scene);

        // Подгоняем утку под нужные нам размеры
        // duck.bakeTransformIntoVertices(BABYLON.Matrix.Translation(0, 0.0, -2.0));
        duck.bakeTransformIntoVertices(BABYLON.Matrix.Scaling(10, 10, 10));
        // duck.bakeTransformIntoVertices(BABYLON.Matrix.RotationX(-Math.PI / 2));
        duck.bakeTransformIntoVertices(BABYLON.Matrix.RotationY(-Math.PI));

        // showNormals(duck, 0.2, new BABYLON.Color3(1, 0, 0), scene);

        // Создаем текстуру на которой будем рисовать
        const textureSize = 1024;
        const dynamicTexture = new BABYLON.DynamicTexture(
          'paint-texture',
          { width: textureSize, height: textureSize },
          scene,
        );

        // Заливаем текстуру серым цветом
        const context = dynamicTexture.getContext();
        context.fillStyle = 'hsl(0, 0%, 98%)';
        context.fillRect(0, 0, textureSize, textureSize);
        dynamicTexture.update(false);

        // Создаем материал для утки
        const materialGround = new BABYLON.StandardMaterial('Mat', scene);
        // materialGround.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
        materialGround.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        materialGround.diffuseTexture = dynamicTexture;
        // materialGround.diffuseTexture = new BABYLON.NoiseProceduralTexture('foo', 2, scene);
        duck.material = materialGround;

        const draw = (texture, x, y) => {
          const data = new Uint8ClampedArray(16);
          for (let i = 0; i < 4; i += 1) {
            data[4 * i] = 255;
            data[4 * i + 1] = 0;
            data[4 * i + 2] = 0;
            data[4 * i + 3] = 255;
          }
          const redDot = new ImageData(data, 2, 2);
          texture.getContext().putImageData(redDot, x, y);
          texture.update(false);
        };

        let isFreeModeActiveDrawing = false;

        const handlePointerDown = e => {
          if (modeRef.current === 'FREE') {
            if (e.button !== 0) {
              return;
            }

            // Только если кликнули по утке
            const pickInfo = scene.pick(scene.pointerX, scene.pointerY, mesh => {
              return mesh === duck;
            });

            if (pickInfo.hit) {
              isFreeModeActiveDrawing = true;

              console.log(pickInfo);

              setTimeout(() => {
                scene.activeCamera.detachControl(canvas);
              }, 0);
            }
          }
        };

        const handlePointerUp = e => {
          if (modeRef.current === 'FREE') {
            isFreeModeActiveDrawing = false;
            scene.activeCamera.attachControl(canvas, true);
          }
        };

        const handlePointerMove = e => {
          if (modeRef.current === 'FREE') {
            const pickInfo = scene.pick(scene.pointerX, scene.pointerY, mesh => {
              return mesh === duck;
            });

            if (pickInfo.hit && isFreeModeActiveDrawing) {
              draw(
                dynamicTexture,
                pickInfo.getTextureCoordinates().x * textureSize,
                pickInfo.getTextureCoordinates().y * textureSize,
              );
            }

            if (pickInfo.hit) {
              // Меняем положение кисти
              //brush.setAbsolutePosition(pickInfo.pickedPoint);

              brush.targetPosition = pickInfo.pickedPoint;


              const axis1 = pickInfo.getNormal();
              const axis2 = BABYLON.Vector3.Up();
              const axis3 = BABYLON.Vector3.Up();
              const start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0); //camera.position
              // const start = scene.activeCamera.position

              BABYLON.Vector3.CrossToRef(start, axis1, axis2);
              BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
              const tmpVec = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);
              const quaternion = BABYLON.Quaternion.RotationYawPitchRoll(
                tmpVec.y,
                tmpVec.x,
                tmpVec.z,
              );
              brush.targetRotationQuaternion = quaternion;
              if (pickInfo.pickedMesh.rotationQuaternion) {
                brush.targetRotationQuaternion = pickInfo.pickedMesh.rotationQuaternion.multiply(
                  quaternion,
                );
              } else {
                brush.targetRotationQuaternion = quaternion;
              }
            }
          }
        };
        canvas.addEventListener('pointermove', handlePointerMove, false);
        canvas.addEventListener('pointerdown', handlePointerDown, false);
        canvas.addEventListener('pointerup', handlePointerUp, false);

        scene.onDispose = () => {
          canvas.removeEventListener('pointermove', handlePointerMove);
          canvas.removeEventListener('pointerdown', handlePointerDown);
          canvas.removeEventListener('pointerup', handlePointerUp);
        };

        return [scene, brush, duck, brushPlus];
      };

      // call the createScene function
      const [scene, brush, duck, brushPlus] = await createScene();
      setIsReady(true);

      const activeKeys = {};
      scene.actionManager = new BABYLON.ActionManager(scene);
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, e => {
          activeKeys[e.sourceEvent.code] = true;
        }),
      );
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, e => {
          activeKeys[e.sourceEvent.code] = false;
        }),
      );

      const rotCam = new BABYLON.TargetCamera('rotCam', new BABYLON.Vector3.Zero(), scene);

      // run the render loop
      engine.runRenderLoop(() => {
        // Едем вперед
        let moveForward = false;
        if (activeKeys.KeyW || activeKeys.ArrowUp) {
          moveForward = true;
        }

        if (moveForward) {
          const projected = BABYLON.Vector3.Zero();
          const pos = brush.position;
          const index = duck.getClosestFacetAtCoordinates(pos.x, pos.y, pos.z, projected);
          console.log(index, pos);
          if (index) {
            brush.position = projected;
          }
        }



          BABYLON.Vector3.LerpToRef(brush.position, brush.targetPosition, 0.25, brush.position);


        BABYLON.Quaternion.SlerpToRef(brush.targetRotationQuaternion, brush.rotationQuaternion, 0.25, brush.rotationQuaternion);

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
