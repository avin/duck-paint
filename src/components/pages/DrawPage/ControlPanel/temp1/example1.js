var createScene = function () {

  var scene = new BABYLON.Scene(engine);

  var camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2, 1.2, 50, new BABYLON.Vector3(0, 0, 0), scene);
  camera.wheelPrecision = 25;
  camera.attachControl(canvas, true);

  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // var knot = BABYLON.Mesh.CreateTorusKnot("knot", 12, 7.0, 128, 64, 2, 5, scene);
  var knot = BABYLON.Mesh.CreateSphere("mys", 3, 7, scene);
  // var knot = BABYLON.MeshBuilder.CreateBox("mys", {width:24.4, height: 10, depth: 23.6}, scene);
  knot.scaling.z = 1.45;
  knot.scaling.x = 0.87;

  // Our built-in 'ground' shape.
  var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 60, height: 60, subdivisions:1}, scene);
  ground.material = new BABYLON.StandardMaterial("gmat", scene);
  ground.material.wireframe = true;


  var csg1 = BABYLON.CSG.FromMesh(knot);
  var csg2 = BABYLON.CSG.FromMesh(ground);

  knot.setEnabled(false);
  ground.setEnabled(false);


  var csg3 = csg2.intersect(csg1);
  var finalMesh = csg3.buildMeshGeometry("newMesh", scene, false);

  // csg1.setEnabled(false);
  // csg2.setEnabled(false);
  // csg3.setEnabled(false);

  // finalMesh.position.x = 10;

  finalMesh.material = new BABYLON.StandardMaterial("stdMat", scene);
  finalMesh.material.wireframe = true;

  return scene;

};
