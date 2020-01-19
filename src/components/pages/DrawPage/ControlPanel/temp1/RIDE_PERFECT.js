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

const createScene = () => {
  const scene = new BABYLON.Scene(engine);

  scene.clearColor = BABYLON.Color3.FromHexString('#293742');

  const mainLight = new BABYLON.HemisphericLight('Hemi', new BABYLON.Vector3(0, 1, 0), scene);
  mainLight.intensity = 0.5;

  const freeCamera = new BABYLON.ArcRotateCamera(
    'free-camera',
    0,
    1.2,
    10,
    BABYLON.Vector3.Zero(),
    scene,
  );

  freeCamera.wheelPrecision = 50;
  freeCamera.lowerBetaLimit = null;
  freeCamera.upperBetaLimit = null;

  scene.activeCamera = freeCamera;
  scene.activeCamera.attachControl(canvas, true);

  // Light
  const cameraLight = new BABYLON.PointLight(
    'camera-light',
    new BABYLON.Vector3.Zero(),
    scene,
  );
  cameraLight.intensity = 0.3;

  // =================================
  // =================================
  // =================================

  // const sphere = BABYLON.MeshBuilder.CreateBox('sphere', { size: 0.05 }, scene);
  const sphere = BABYLON.MeshBuilder.CreateSphere(
    'sphere',
    { segments: 10, diameter: 0.05 },
    scene,
  );
  sphere.material = new BABYLON.StandardMaterial('sphereMat', scene);
  sphere.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
  sphere.material.alpha = 0.85;

  sphere.position.x = 0.1;

  // ---------------------------------

  const mesh = BABYLON.MeshBuilder.CreateSphere('m', { segments: 20, diameter: 6 }, scene);

  mesh.material = new BABYLON.StandardMaterial('mat', scene);
  mesh.material.alpha = 0.1;
  mesh.material.backFaceCulling = false;
  // mesh.material.wireframe = true;

  drawNormals(mesh, 0.05, scene);

  // ---------------------------------

  const initTime = Date.now();
  let time = 0;

  // ---------------------------------

  let lastNormal;
  let prevNormal;

  let angle = 0;

  sphere.position = new BABYLON.Vector3(0, 3, 0);
  lastNormal = new BABYLON.Vector3(0, 1, 0);
  prevNormal = new BABYLON.Vector3(0, 1, 0);

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

  const axis = BABYLON.Vector3.Zero();
  function setDirection(normal, quaternion) {
    quaternion = quaternion || new BABYLON.Quaternion();

    axis.set(normal.z, 0, -normal.x).normalize();
    const radians = Math.acos(normal.y);

    quaternion = BABYLON.Quaternion.RotationAxisToRef(axis, radians, quaternion);

    return quaternion;
  }

  // ------------------------------------

  const coRAt = new BABYLON.Vector3(0, 0, 0);
  const pilotStart = new BABYLON.Vector3(1, 0, 1);

  const pivot = new BABYLON.TransformNode('root1');
  const pilot = new BABYLON.TransformNode('root2');

  pivot.position = coRAt;
  pilot.parent = pivot;
  pilot.position = pilotStart;

  // ----------------------------------------

  let setFromUnitVectorsAxis = BABYLON.Vector3.Zero();
  function setFromUnitVectorsToRef(v1, v2, ref) {
    const angle = Math.acos(BABYLON.Vector3.Dot(v1, v2));
    BABYLON.Vector3.CrossToRef(v1, v2, setFromUnitVectorsAxis);
    const quaternion = BABYLON.Quaternion.RotationAxisToRef(
      setFromUnitVectorsAxis,
      angle,
      ref,
    );
  }

  // ----------------------------------------

  let quatRot = new BABYLON.Quaternion();
  let first = true;
  const speed = 2.25;
  let prevTime = time - 0.1;
  let diffTime;


  // ======================
  // ANIMATION
  // ======================

  scene.registerBeforeRender(params => {
    time = (Date.now() - initTime) * 0.001;
    diffTime = time - prevTime;

    if (activeKeys.KeyA || activeKeys.ArrowLeft) {
      angle -= 0.1;
    } else if (activeKeys.KeyD || activeKeys.ArrowRight) {
      angle += 0.1;
    }

    const n = lastNormal;
    const np = prevNormal;


    // ----------------------------------------------------

    if (first) {
      setFromUnitVectorsToRef(new BABYLON.Vector3(0, 1, 0), n, quatRot);
    } else {
      const diffRot = new BABYLON.Quaternion()
      setFromUnitVectorsToRef(prevNormal,lastNormal , diffRot);

      console.log(diffRot);

      diffRot.multiplyToRef(quatRot, quatRot);
      // quatRot.multiplyToRef(, quatRot);
      // quatRot = quatRot.normalize()
      // console.log(diffRot);
    }

    pivot.rotationQuaternion = quatRot;
    pilot.position.x = Math.sin(angle);
    pilot.position.z = Math.cos(angle);

    const f = pilot.getAbsolutePosition();

    // -------DETECT NEXT POSITION------------

    const s1 = 0.1; // height
    const s2 = speed * diffTime; // step

    const bPos = n
      .multiply(new BABYLON.Vector3(s1, s1, s1))
      .add(f.multiply(new BABYLON.Vector3(s2, s2, s2)));
    const rayFrom = bPos.add(sphere.position);
    const rayTo = bPos.add(n.negate());
    const ray = new BABYLON.Ray(rayFrom, rayTo, 0.2);

    let rayHelper = new BABYLON.RayHelper(ray);
    rayHelper.show(scene);
    setTimeout(() => {
      rayHelper.dispose();
    }, 300);

    const pickInfo = scene.pickWithRay(ray, pickMesh => {
      return pickMesh === mesh;
    });
    if (pickInfo.hit) {
      // check red cube pose
      sphere.position = pickInfo.pickedPoint;

      prevNormal = lastNormal;
      // save normal for next raycast
      lastNormal = pickInfo.getNormal();
    }
  });

  scene.registerAfterRender(params => {
    prevTime = time;
    first = false;
  });

  return scene;
};
