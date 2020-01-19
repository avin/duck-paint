# duck-paint

+ запретить зумить арк-камеру до инвертации

https://doc.babylonjs.com/how_to/parametric_shapes#extruded-shapes

### vector rotation

https://www.babylonjs-playground.com/#7RLWEG

### vector direction

https://www.babylonjs-playground.com/#LWSI5A#1

### var

https://playground.babylonjs.com/#PGRNB3#2
https://www.babylonjs-playground.com/#14MFVB#6

```js
function setDirectionOLD(normal, quaternion) {
  var axis = BABYLON.Vector3.Zero();

  quaternion = quaternion || new BABYLON.Quaternion();

  axis.set(normal.z, 0, -normal.x).normalize();
  var radians = Math.acos(normal.y);

  quaternion = new BABYLON.Quaternion.RotationAxis(axis, radians);

  return quaternion;
}

var quaternionFromNormal = function(vecY) {
  if (Math.abs(vecY.x) < BABYLON.Epsilon && Math.abs(vecY.z) < BABYLON.Epsilon) {
    return BABYLON.Quaternion.Zero();
  }
  const vecX = new BABYLON.Vector3(-vecY.z, 0, vecY.x).normalize();
  const vecZ = BABYLON.Vector3.Cross(vecX, vecY).normalize();
  return BABYLON.Quaternion.RotationQuaternionFromAxis(vecX, vecY, vecZ);
};

function setDirection(vec3) {
  var right = BABYLON.Vector3.Cross(vec3, new BABYLON.Vector3(0, -1, 0)).normalize();
  var up = BABYLON.Vector3.Cross(vec3, right);
  return BABYLON.Quaternion.RotationQuaternionFromAxis(right, up, vec3);
}
```


https://community.khronos.org/t/rotate-a-quaternion-to-a-surface-normal/49424/3



https://www.babylonjs-playground.com/#XF5NRH


РАБОЧИЙ ВАРИАНт
https://www.babylonjs-playground.com/#XF5NRH#2


https://www.babylonjs-playground.com/#SQFG0Q#6


// Выбор цвета

https://www.babylonjs-playground.com/#VBY1JS#1
