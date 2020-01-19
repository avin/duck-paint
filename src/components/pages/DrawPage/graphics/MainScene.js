import * as BABYLON from 'babylonjs';
import merge from 'lodash/merge';
import Brush from '@/components/pages/DrawPage/graphics/Brush';

// Основная палитра, отсюда будем брать все цвета
const colorPalette = [
  '#08141e',
  '#1D2B53',
  '#7E2553',
  '#008751',
  '#AB5236',
  '#5F574F',
  '#C2C3C7',
  '#FFF1E8',
  '#FF004D',
  '#FFA300',
  '#FFEC27',
  '#00E436',
  '#29ADFF',
  '#83769C',
  '#FF77A8',
  '#FFCCAA',
];

class MainScene {
  // Основной движок BABYLON
  engine = null;

  // Сцена BABYLON на которой всё происходит
  scene = null;

  // Текущий игровой режим (DRIVE / FREE)
  playMode = 'DRIVE';

  // Основной свет сцены
  mainLight = null;

  // Текущие нажатые кнопки
  activeKeys = {};

  // Время проведенное в рендере
  time = 0;

  // Разница во времени между последними кадрами
  timeDiff = 0;

  // Текущий кадр
  tick = 0;

  // Остановлен рендер
  isStopped = false;

  // Остановлено перемещение фигур
  isPaused = false;

  // Режим камеры для езды
  driveCameraMode = 'CLASSIC';

  // Каталог доступных главных фигур
  mainMeshesCatalogue = {
    duck: {
      id: 'duck',
      location: 'static/assets/scenes/',
      fileName: 'duck.obj',
      meshIndex: 0,
      scale: [10, 10, 10],
      rotation: [0, -Math.PI, 0],
      textureSize: window.isMobile ? 2000 : 4000,
      brushInitPointPosition: [-6.223477418636669, 4.193322954756397, 0.13768080415772133],
    },
  };

  // Визуальные настройки
  visualOptions = {
    // Цвет фона
    clearColor: colorPalette[0],
  };

  constructor(options) {
    // Подменяем текущий дефолт
    merge(this, options);
  }

  /**
   * Инициализация управления
   */
  initControl() {
    const { scene } = this;

    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, e => {
        this.activeKeys[e.sourceEvent.code] = true;
      }),
    );
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, e => {
        this.activeKeys[e.sourceEvent.code] = false;
      }),
    );

    scene.onPointerObservable.add(e => {
      if (this.playMode === 'FREE') {
        this.brushes[0].handlePointerUp(e);
      }
    }, BABYLON.PointerEventTypes.POINTERUP);

    scene.onPointerObservable.add(e => {
      if (this.playMode === 'FREE') {
        this.brushes[0].handlePointerDown(e);
      }
    }, BABYLON.PointerEventTypes.POINTERDOWN);

    scene.onPointerObservable.add(e => {
      if (this.playMode === 'FREE') {
        this.brushes[0].handlePointerMove(e);
      }
    }, BABYLON.PointerEventTypes.POINTERMOVE);
  }

  /**
   * Инициализация главной фигуры (по которой ездим)
   * @param meshId - id загружаемой фигуры (из this.mainMeshesCatalogue)
   */
  async initMainMesh(meshId) {
    this.currentMeshOptions = this.mainMeshesCatalogue[meshId];

    const { location, fileName, meshIndex, scale, rotation, textureSize } = this.currentMeshOptions;

    // Грузим модельку
    const { meshes } = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      location,
      fileName,
      this.scene,
    );
    const mainMesh = meshes[meshIndex];
    this.mainMesh = mainMesh;

    // Подгоняем модель под оптимальные размеры
    mainMesh.bakeTransformIntoVertices(BABYLON.Matrix.Scaling(scale[0], scale[1], scale[2]));
    if (rotation[0]) {
      mainMesh.bakeTransformIntoVertices(BABYLON.Matrix.RotationX(rotation[0]));
    }
    if (rotation[1]) {
      mainMesh.bakeTransformIntoVertices(BABYLON.Matrix.RotationY(rotation[1]));
    }
    if (rotation[2]) {
      mainMesh.bakeTransformIntoVertices(BABYLON.Matrix.RotationZ(rotation[2]));
    }

    // Создаем текстуру на которой будем рисовать
    const drawTexture = new BABYLON.DynamicTexture(
      'paint-texture',
      { width: textureSize, height: textureSize },
      this.scene,
    );
    this.meshDrawTexture = drawTexture;
    this.meshDrawTexture.anisotropicFilteringLevel = 0;
    {
      // Заливаем текстуру почти белым цветом
      const context = drawTexture.getContext();
      context.fillStyle = 'hsl(0, 0%, 98%)';
      context.fillRect(0, 0, textureSize, textureSize);
      drawTexture.update(false);
    }

    // Создаем основной материал для фигуры
    const materialGround = new BABYLON.StandardMaterial('front-side-material', this.scene);
    materialGround.emissiveColor = new BABYLON.Color3(0.35, 0.4, 0.4);
    materialGround.diffuseTexture = drawTexture;
    materialGround.specularPower = 1000.0;
    materialGround.specularColor = new BABYLON.Color3(0.25, 0.25, 0.25);

    mainMesh.material = materialGround;

    // Делаем копию фигуры для обратной поверхности
    const mainMashBackSide = mainMesh.clone('main-mash-back-side');
    this.mainMashBackSide = mainMashBackSide;

    // Делаем материал для изнанки (прозрачный и с текстурой как на фронтальной поверхности)
    const backSideMaterial = new BABYLON.StandardMaterial('back-side-material', this.scene);
    backSideMaterial.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
    backSideMaterial.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);
    backSideMaterial.emissiveColor = new BABYLON.Color3(0.15, 0.2, 0.2);
    backSideMaterial.diffuseTexture = drawTexture;
    backSideMaterial.alpha = 0.6;
    mainMashBackSide.material = backSideMaterial;

    mainMashBackSide.isPickable = false;

    // ---------- Оптимизация ----------

    // Делаем дерево для ускорения просчета рейкаста
    mainMesh.subdivide(64);
    mainMesh.createOrUpdateSubmeshesOctree();

    // Фризим матрицы (т.к фигура статична)
    mainMashBackSide.freezeWorldMatrix();
    mainMesh.freezeWorldMatrix();

    // Это тоже нам не надо
    mainMashBackSide.doNotSyncBoundingInfo = true;
    mainMesh.doNotSyncBoundingInfo = true;
  }

  /**
   * Нарисовать точку в месте прикосновения кисти (ЭКСПЕРИМЕНТАЛЬНО)
   * @param pickInfo
   * @param color
   */
  drawPointRaw(pickInfo, color) {
    const { textureSize } = this.currentMeshOptions;

    const x = pickInfo.getTextureCoordinates().x * textureSize;
    const y = pickInfo.getTextureCoordinates().y * textureSize;

    const dotSize = 16;
    const dotSizeN2 = dotSize * dotSize;
    const dotSizeH2 = dotSize / 2;

    const data = new Uint8ClampedArray(dotSizeN2 * 4);
    for (let i = 0; i < dotSizeN2; i += 1) {
      data[4 * i] = ~~(color.r * 255);
      data[4 * i + 1] = ~~(color.g * 255);
      data[4 * i + 2] = ~~(color.b * 255);
      data[4 * i + 3] = 255;
    }
    const redDot = new ImageData(data, dotSize, dotSize);
    this.meshDrawTexture.getContext().putImageData(redDot, x - dotSizeH2, y - dotSizeH2);
    this.meshDrawTexture.update(false);
  }

  /**
   * Нарисовать точку в месте прикосновения кисти
   * @param pickInfo
   * @param color
   */
  drawPoint(pickInfo, color) {
    const { textureSize } = this.currentMeshOptions;

    const x = pickInfo.getTextureCoordinates().x * textureSize;
    const y = pickInfo.getTextureCoordinates().y * textureSize;

    const ctx = this.meshDrawTexture.getContext();

    if (!color.colorString) {
      color.colorString = `rgb(${~~(color.r * 255)},${~~(color.g * 255)},${~~(color.b * 255)})`;
    }

    // Радиус (подгоняется под размер кисти)
    const radius = this.currentMeshOptions.textureSize / 400;

    ctx.fillStyle = color.colorString;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  /**
   * Инициализация камеры следующей за кистью для режима езды
   */
  initDriveCamera() {
    const camera = new BABYLON.UniversalCamera(
      'drive-camera',
      new BABYLON.Vector3(0, 0, 0),
      this.scene,
    );
    this.driveCamera = camera;
    camera.cameraAcceleration = 0.05;
    camera.checkCollisions = false;

    // Не реагирует на клаву и мышь
    camera.inputs.clear();

    // Находится над кистью позади неё (как в GTA)
    camera.position.y = 5;
    camera.position.z = -5;

    // Смотрим на кисть
    camera.rotation = new BABYLON.Vector3(Math.PI / 5, 0.005499999999999996, 0);
  }

  /**
   * Инициализация альтернативной камеры следующей за кистью для режима езды
   */
  initDriveArcCamera() {
    const camera = new BABYLON.ArcRotateCamera(
      'drive-arc-camera',
      -7.8836942647442125, // Alpha
      0.3592756568269219, // Beta
      0,
      new BABYLON.Vector3(0, 20, 0), // Позиция над фигурой
      this.scene,
    );
    this.driveArcCamera = camera;
    camera.cameraAcceleration = 0.05;
    camera.zoomOnFactor = 0.01;
    camera.checkCollisions = false;
  }

  /**
   * Инициализация камеры свободного вращения для режима свободного рисования
   */
  initFreeCamera() {
    const camera = new BABYLON.ArcRotateCamera(
      'free-camera',
      0.75,
      1.2,
      60,
      BABYLON.Vector3.Zero(),
      this.scene,
    );
    this.freeCamera = camera;

    // Убираем ограничения вращения
    camera.lowerBetaLimit = null;
    camera.upperBetaLimit = null;

    camera.lowerRadiusLimit = 15;
    camera.upperRadiusLimit = 100;

    camera.useBouncingBehavior = true;
  }

  applyRenderPipeline() {
    const pipeline = new BABYLON.DefaultRenderingPipeline(
      'default-pipeline',
      true,
      this.scene,
      [this.freeCamera, this.driveCamera, this.driveArcCamera], // The list of cameras to be attached to
    );
    this.renderPipeline = pipeline;

    pipeline.chromaticAberrationEnabled = true;
    pipeline.chromaticAberration.aberrationAmount = 15.7;
    pipeline.chromaticAberration.radialIntensity = 0.8;

    pipeline.fxaaEnabled = true;

    pipeline.glowLayerEnabled = true;
    pipeline.glowLayer.blurKernelSize = 16;
    pipeline.glowLayer.intensity = 0.1;

    pipeline.glowLayerEnabled = true;

    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.contrast = 1.1;
    pipeline.imageProcessing.exposure = 1.1;
    pipeline.imageProcessing.vignetteEnabled = true;
    pipeline.imageProcessing.vignetteWeight = 0.1;
    pipeline.imageProcessing.vignetteStretch = 0.1;
    pipeline.imageProcessing.vignetteCameraFov = 0.3;

    pipeline.depthOfFieldEnabled = !window.isMobile;
    pipeline.depthOfField.focalLength = 2735;
    pipeline.depthOfField.fStop = 16.9;
    pipeline.depthOfField.focusDistance = 7169;
    pipeline.depthOfField.lensSize = 38;

    pipeline.grainEnabled = true;
    pipeline.grain.intensity = 2;
    pipeline.grain.animated = false;
  }

  async init() {
    const scene = new BABYLON.Scene(this.engine);
    this.scene = scene;

    // Для быстрого доступа к сцене и отладки
    window.s = scene;

    scene.clearColor = BABYLON.Color3.FromHexString(this.visualOptions.clearColor);

    const env = scene.createDefaultEnvironment({
      enableGroundShadow: false,
      skyboxSize: 200,
      groundSize: 0,
      skyboxColor: BABYLON.Color3.FromHexString(this.visualOptions.clearColor),
    });
    env.rootMesh.isPickable = false;
    env.skybox.isPickable = false;

    // Добавляем главный свет
    const mainLight = new BABYLON.HemisphericLight('Hemi', new BABYLON.Vector3(0, 1, 0), scene);
    this.mainLight = mainLight;
    mainLight.intensity = 0.05;

    this.initFreeCamera();

    this.initDriveCamera();
    this.initDriveArcCamera();

    this.applyRenderPipeline();

    // Свет камеры
    this.cameraLight = new BABYLON.PointLight('camera-light', new BABYLON.Vector3.Zero(), scene);
    this.cameraLight.intensity = 0.43;

    await this.initMainMesh('duck');

    const colors = [
      colorPalette[8],
      colorPalette[9],
      colorPalette[11],
      colorPalette[12],
      colorPalette[13],
      colorPalette[14],
      colorPalette[15],
    ];
    this.brushes = [];
    const totalBrushes = 5;
    for (let i = 0; i < totalBrushes; i += 1) {
      const colorHex = colors[i % colors.length];
      const color = BABYLON.Color3.FromHexString(colorHex);

      this.brushes.push(
        new Brush({
          mainScene: this,
          index: i,
          withParticles: !window.isMobile,
          color,
          angle: ((Math.PI * 2) / totalBrushes) * i,
        }),
      );
    }
    this.brushes[0].isActive = true;

    // Для прикола! Если фигур много, ставим последней режим змеи
    if (totalBrushes >= 5) {
      this.brushes[totalBrushes - 1].snakeMode = true;
    }

    this.initControl();

    // Триггерим событие смены режима
    this.setPlayMode(this.playMode);

    this.sceneInstrumentation = new BABYLON.SceneInstrumentation(this.scene);

    scene.registerBeforeRender(() => {
      this.update();
    });

    scene.registerAfterRender(() => {
      this._realTime = Date.now();
      if (this._prevRealTime) {
        const timeDiff = (this._realTime - this._prevRealTime) / 1000;
        this.time += timeDiff;
        this.timeDiff = timeDiff;
      }
      this._prevRealTime = this._realTime;

      this.tick += 1;
    });

    return scene;
  }

  update() {
    // Синхронизируем положение света камеры
    this.cameraLight.position = this.scene.activeCamera.globalPosition;

    // Выполняем логику обновления по всем кистям
    for (let i = 0; i < this.brushes.length; i += 1) {
      this.brushes[i].update();
    }

    // Грузим обновления по текстурке в видяху
    this.meshDrawTexture.update(false);
  }

  render() {
    this.scene.render();
  }

  setPlayMode(mode) {
    this.playMode = mode;

    // Отвызываем контроль с текущей камеры (она поменяется)
    if (this.scene.activeCamera) {
      this.scene.activeCamera.detachControl(this.canvas);
    }

    switch (mode) {
      case 'FREE': {
        this.scene.activeCamera = this.freeCamera;
        if (this.renderPipeline) {
          this.renderPipeline.depthOfFieldEnabled = false;
        }
        break;
      }
      case 'DRIVE': {
        if (this.driveCameraMode === 'CLASSIC') {
          this.scene.activeCamera = this.driveCamera;
          if (this.renderPipeline) {
            this.renderPipeline.depthOfFieldEnabled = !window.isMobile;
          }
        } else if (this.driveCameraMode === 'ARC') {
          this.scene.activeCamera = this.driveArcCamera;
          if (this.renderPipeline) {
            this.renderPipeline.depthOfFieldEnabled = false;
          }
        }

        break;
      }
      default:
    }

    // Привязываем контроль к новой активной камере
    this.scene.activeCamera.attachControl(this.canvas, true);

    for (let i = 0; i < this.brushes.length; i += 1) {
      // Извещаем кисти о смене режима
      this.brushes[i].handleChangePlayMode(this.playMode);
    }
  }

  changeDriveCameraMode(driveCameraMode) {
    if (this.playMode !== 'DRIVE') {
      return;
    }

    if (!driveCameraMode) {
      if (this.driveCameraMode === 'CLASSIC') {
        driveCameraMode = 'ARC';
      } else {
        driveCameraMode = 'CLASSIC';
      }
    }

    this.driveCameraMode = driveCameraMode;
    this.setPlayMode(this.playMode);
  }

  /**
   * Остановить рендер
   * @param val
   */
  stop(val = true) {
    this._prevRealTime = Date.now();

    this.isStopped = val;

    this.resetActiveKeys();
  }

  /**
   * Поставить на паузу (для режима DRIVE)
   * @param val
   */
  pause(val = true) {
    this._prevRealTime = Date.now();

    this.isPaused = val;

    this.resetActiveKeys();
  }

  /**
   * Сбросить состояние нажатых кнопок
   */
  resetActiveKeys() {
    Object.keys(this.activeKeys).forEach(k => delete this.activeKeys[k]);
  }
}
export default MainScene;
