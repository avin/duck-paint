import merge from 'lodash/merge';
import * as BABYLON from 'babylonjs';
import { rotateQuaternionByNormalChangeToRef, setDirectionToRef } from '@/utils/math3d';
import { perlin2 } from '@/utils/perlin';

class Brush {
  // Объект главной сцены
  mainScene = null;

  // Использовать партиклы
  withParticles = true;

  // Кисть является основной
  _isActive = false;

  // Минимальная скорость
  minSpeed = 2.25;

  // Максимальная скорость
  maxSpeed = 5;

  // Текущая скорость
  speed = this.minSpeed;

  // Порядковый уникальный номер кисти (идентификатор)
  index = 0;

  // Хранилище под временные объекты для экономии памяти
  // чтоб каждый раз не создавать объекты, будем использовать через
  // Ref-методы BABYLON для присвоения значений к уже готовым объектам
  _tmp = {
    bPos: BABYLON.Vector3.Zero(),
    rayFrom: BABYLON.Vector3.Zero(),
    rayTo: BABYLON.Vector3.Zero(),
    ray: new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero(), 1.2),
  };

  // Угол поворода (радианы)
  angle = 0;

  constructor(options) {
    merge(this, options);

    this.init();
  }

  init() {
    const {
      id,
      brushSrc,
      mainScene: {
        scene,
        currentMeshOptions: { brushInitPointPosition },
      },
    } = this;

    const brush = brushSrc.clone(`brush-${id}`);

    this.brush = brush;

    const brushMaterial = new BABYLON.StandardMaterial('brush-material', scene);
    brushMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    brushMaterial.diffuseColor = this.color;
    brushMaterial.emissiveColor = this.color.scale(0.75);
    brush.material = brushMaterial;

    // Кисти не учавствуют в рейкасте
    brush.isPickable = false;

    // Немного выделяем грани (чисто для декора)
    // brush.enableEdgesRendering();
    // brush.edgesWidth = 0.5;
    // brush.edgesColor = BABYLON.Color4.FromColor3(this.color.scale(0.5), 0.5);

    // Определяем направляющие.
    // Направляющие содержат позицию и вращения которую должны приобрести
    // связанные сущности через интерполяцию для гладкости происходящего

    // Направляющая для кисти,
    // хранит в себе данные полученные при рейкасте
    this.generalNode = new BABYLON.TransformNode('general-node');
    this.generalNode.position = new BABYLON.Vector3(
      brushInitPointPosition[0],
      brushInitPointPosition[1],
      brushInitPointPosition[2],
    );
    this.generalNode.prevPosition = BABYLON.Vector3.Zero();
    this.generalNode.prevPrevPosition = BABYLON.Vector3.Zero();
    this.generalNode.rotationQuaternion = new BABYLON.Quaternion();
    this.generalNode.directedRotationQuaternion = new BABYLON.Quaternion();

    // Направляющая для вращения прицела для луча
    this.rotationPivot = new BABYLON.TransformNode('rotation-pivot');
    this.rotationPivot.position = BABYLON.Vector3.Zero();

    // Сам прицел для луча
    this.rayPilot = new BABYLON.TransformNode('rayPilot');
    this.rayPilot.parent = this.rotationPivot;
    this.rayPilot.position = new BABYLON.Vector3(1, 0, 1);

    // Направляющая для камеры
    this.cameraNode = new BABYLON.TransformNode('camera-node');
    this.cameraNode.position = brush.position.clone();
    this.cameraNode.rotationQuaternion = new BABYLON.Quaternion();

    // Инициализируем положение кисти через направляющую
    brush.parent = this.generalNode;
    brush.position = new BABYLON.Vector3.Zero();
    brush.rotationQuaternion = new BABYLON.Quaternion();

    this.prevPosition = this.generalNode.position;
    this.direction = new BABYLON.Vector3.Zero();

    // Инициализируем вспомогательные значения для перемещения
    this.reset();
    this.updateSpeedFactor();

    // Включаем частицы
    if (this.withParticles) {
      this.initParticles();
    }
  }

  initParticles() {
    // Create a particle system
    const particleSystem = new BABYLON.ParticleSystem('particles', 2000, this.mainScene.scene);
    this.particleSystem = particleSystem;

    particleSystem.particleTexture = new BABYLON.Texture(
      'static/assets/textures/flare.png',
      this.mainScene.scene,
    );

    particleSystem.emitter = this.generalNode; // the starting object, the emitter

    particleSystem.color1 = this.color;
    particleSystem.color2 = new BABYLON.Color4(0.92, 0.15, 0.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.0, 1);

    particleSystem.emitRate = 0;

    // Выставляем зависимые значения
    this.tuneParticlesSystem();

    // Start the particle system
    particleSystem.start();
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(val) {
    if (val) {
      this.mainScene.driveCamera.parent = this.cameraNode;

      this.mainScene.driveArcCamera.target = this.cameraNode.position;
    }

    // eslint-disable-next-line no-underscore-dangle
    this._isActive = val;
  }

  reset() {
    this.prevNormal = null;
    this.nextNormal = null;
    this.quatRot = null;
    this.isFreeModeActiveDrawing = false;
  }

  speedUp() {
    if (this.speed === this.maxSpeed) {
      return;
    }

    const speedDiff = (this.maxSpeed - this.minSpeed) / 100;

    this.speed += speedDiff;
    this.speed = Math.min(this.speed, this.maxSpeed);
    this.speed = Math.max(this.speed, this.minSpeed);

    this.updateSpeedFactor();
    this.tuneParticlesSystem();
  }

  speedDown() {
    if (this.speed === this.minSpeed) {
      return;
    }

    const speedDiff = (this.maxSpeed - this.minSpeed) / 100;

    this.speed -= speedDiff;
    this.speed = Math.min(this.speed, this.maxSpeed);
    this.speed = Math.max(this.speed, this.minSpeed);

    this.updateSpeedFactor();
    this.tuneParticlesSystem();
  }

  updateSpeedFactor() {
    this.speedFactor = (this.speed - this.minSpeed) / (this.maxSpeed - this.minSpeed);

    this.mainScene.driveCamera.fov = 0.8 + this.speedFactor * 0.5;
  }

  /**
   * Выставить зависимые от скорости значения для системы частиц
   */
  tuneParticlesSystem() {
    if (!this.withParticles) {
      return;
    }

    const { particleSystem } = this;

    let speedFactorX;

    if (this.mainScene.playMode === 'DRIVE') {
      speedFactorX = Math.max(0.25, this.speedFactor) - 0.6;
    } else if (this.mainScene.playMode === 'FREE') {
      if (this.isFreeModeActiveDrawing) {
        speedFactorX = 0.6;
      } else {
        speedFactorX = 0;
      }
    }

    particleSystem.emitRate = 5500 * speedFactorX;
    particleSystem.particleEmitterType = new BABYLON.BoxParticleEmitter(1);

    particleSystem.minLifeTime = 0.05;
    particleSystem.maxLifeTime = 0.4;

    particleSystem.maxEmitPower = speedFactorX * 2 * 5;

    particleSystem.minSize = 0.1;
    particleSystem.maxSize = speedFactorX * 0.5;

    particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);

    particleSystem.minEmitBox = new BABYLON.Vector3(-0.25, -0.075, -0.25);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.25, 0.075, 0.25);

    particleSystem.minEmitBox = new BABYLON.Vector3.Zero();
    particleSystem.maxEmitBox = new BABYLON.Vector3.Zero();
  }

  update() {
    const {
      brush,
      mainScene: { playMode, timeDiff },
    } = this;

    const timeDiffXSpeed = timeDiff * this.speed;

    this.tuneParticlesSystem();

    BABYLON.Quaternion.SlerpToRef(
      brush.rotationQuaternion,
      this.generalNode.directedRotationQuaternion,
      timeDiffXSpeed * 6,
      brush.rotationQuaternion,
    );

    BABYLON.Quaternion.SlerpToRef(
      this.cameraNode.rotationQuaternion,
      this.generalNode.directedRotationQuaternion,
      timeDiffXSpeed,
      this.cameraNode.rotationQuaternion,
    );
    BABYLON.Vector3.LerpToRef(
      this.cameraNode.position,
      this.generalNode.position,
      timeDiffXSpeed * 2,
      this.cameraNode.position,
    );

    if (playMode === 'DRIVE') {
      if (!this.mainScene.isPaused) {
        this.updateInDriveMode();
      }
    }
  }

  /**
   * Обновление кисти в режиме DRIVE
   */
  updateInDriveMode(retry = 0) {
    const { mainScene } = this;

    const { activeKeys, scene, mainMesh, timeDiff, time } = mainScene;

    const angleDiff = 0.02 + 0.3 / (this.speed * 3);

    if (this.isActive) {
      if (activeKeys.KeyA || activeKeys.ArrowLeft) {
        this.angle -= angleDiff;
      }
      if (activeKeys.KeyD || activeKeys.ArrowRight) {
        this.angle += angleDiff;
      }
      if (activeKeys.KeyW || activeKeys.ArrowUp) {
        this.speedUp();
      } else {
        this.speedDown();
      }
    } else {
      this.angle += angleDiff * perlin2(this.index * 100, this.mainScene.time);
    }

    // Режим змеи, движения туда-сюда ползем как змея
    if (this.snakeMode) {
      this.angle += Math.sin(time * 20) * 0.08;
    }

    // ----------------------------------------------------

    // Cчитаем боковое отклонение для стреляющего луча
    this.rayPilot.position.x = Math.sin(this.angle + retry * 0.3);
    this.rayPilot.position.z = Math.cos(this.angle + retry * 0.3);

    // Определяющие для положения стреляющего луча
    const s1 = this.speed * timeDiff * (2 + retry * 0.25); // высота точки выстрела луча над поверхностью
    const s2 = this.speed * timeDiff; // шаг/отдаление от текущей позиции

    if (!this.nextNormal) {
      this.nextNormal = new BABYLON.Vector3(0, 1, 0);
    }

    const {
      _tmp: { rayFrom, rayTo, ray, bPos },
    } = this;

    // Поднимаемся над поверхностью в направление вектора нормали на высоту s1
    this.nextNormal.scaleToRef(s1, bPos);

    // Прибавляем позиции в направлении вращения на велицину шага s2
    bPos.addToRef(this.rayPilot.getAbsolutePosition().scale(s2), bPos);

    // Позиционируем на мировоую координату по текущей позиции направляющей
    bPos.addToRef(this.generalNode.position, rayFrom);

    const negateNextNormal = this.nextNormal.negate();
    bPos.addToRef(negateNextNormal, rayTo);
    rayTo.normalizeToRef(rayTo);

    ray.origin = rayFrom;
    ray.direction = rayTo;

    const pickInfo = scene.pickWithRay(ray, pickMesh => {
      return pickMesh === mainMesh;
    });

    if (pickInfo.hit) {
      this.handlePickHit(pickInfo);

      this.rotationPivot.rotationQuaternion = this.quatRot;

      mainScene.drawPoint(pickInfo, this.color);
    }

    if (this.generalNode.prevPrevPosition) {
      const { prevPrevPosition, position } = this.generalNode;

      const diff =
        Math.abs(position.x - prevPrevPosition.x) +
        Math.abs(position.y - prevPrevPosition.y) +
        Math.abs(position.z - prevPrevPosition.z);

      // Если движения нет - вероятно застряли - делаем попытку выбраться (не больше 10 раз)
      if (diff === this.moveDiff) {
        if (retry < 10) {
          this.updateInDriveMode(retry + 1);
        }
      }

      this.moveDiff = diff;
    }
  }

  // updateInFreeMode() {
  //   //
  // }

  setIsFreeModeActiveDrawing(val) {
    this.isFreeModeActiveDrawing = val;

    this.tuneParticlesSystem();
  }

  handlePointerUp() {
    const {
      mainScene: { scene, canvas },
    } = this;

    this.setIsFreeModeActiveDrawing(false);

    scene.activeCamera.attachControl(canvas, true);
  }

  handlePointerDown(params) {
    const { event, pickInfo } = params;

    // Только на левую кнопку
    if (event.button !== 0) {
      return;
    }

    const {
      mainScene: { scene, canvas },
    } = this;

    // Только если кликнули по утке
    if (pickInfo.hit) {
      this.setIsFreeModeActiveDrawing(true);

      scene.activeCamera.detachControl(canvas);
    }

    this.handlePointerMove(params);
  }

  handlePointerMove({ pickInfo }) {
    const {
      mainScene: { scene },
    } = this;

    pickInfo = scene.pick(scene.pointerX, scene.pointerY);

    if (pickInfo.hit) {
      this.handlePickHit(pickInfo);

      if (this.isFreeModeActiveDrawing) {
        this.mainScene.drawPoint(pickInfo, this.color);
      }
    }
  }

  handlePickHit(pickInfo) {
    this.generalNode.prevPrevPosition.copyFrom = this.generalNode.prevPosition;
    this.generalNode.prevPosition.copyFrom(this.generalNode.position);
    this.generalNode.position.copyFrom(pickInfo.pickedPoint);

    this.generalNode.position.subtractToRef(this.prevPosition, this.direction);
    this.direction.normalizeToRef(this.direction);

    this.prevNormal = this.nextNormal;
    this.nextNormal = pickInfo.getNormal();

    if (!this.quatRot) {
      this.quatRot = setDirectionToRef(this.nextNormal, this.quatRot);
    } else {
      rotateQuaternionByNormalChangeToRef(
        this.quatRot,
        this.prevNormal,
        this.nextNormal,
        this.quatRot,
      );

      const r = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), this.angle);

      this.generalNode.directedRotationQuaternion = this.quatRot.multiply(r).normalize();
    }
  }

  handleChangePlayMode(playMode) {
    switch (playMode) {
      case 'DRIVE': {
        // Делаем все кисти видимыми
        this.brush.setEnabled(true);
        break;
      }
      case 'FREE': {
        // Видимой оставляем только активную кисть
        if (this.isActive) {
          this.brush.setEnabled(true);
        } else {
          this.brush.setEnabled(false);
        }
        break;
      }
      default:
    }
  }
}

export default Brush;
