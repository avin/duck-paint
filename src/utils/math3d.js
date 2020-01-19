import * as BABYLON from 'babylonjs';
import isNaN from 'lodash/isNaN';

// ------- Временные и постоянные объекты ---------

const tmpVector1 = BABYLON.Vector3.Zero();
const tmpVector2 = BABYLON.Vector3.Zero();
const tmpVector3 = BABYLON.Vector3.Zero();
const tmpQuaternion1 = new BABYLON.Quaternion();
const startRotation = new BABYLON.Vector3(0, 1, 0);

// ---------------------------

/**
 *
 * @param v1
 * @param v2
 * @param ref
 */
export function setFromUnitVectorsToRef(v1, v2, ref) {
  const angle = Math.acos(BABYLON.Vector3.Dot(v1, v2));
  BABYLON.Vector3.CrossToRef(v1, v2, tmpVector1);
  BABYLON.Quaternion.RotationAxisToRef(tmpVector1, angle, ref);
}

// ---------------------------

/**
 *
 * @param mesh
 * @param normal
 */
export function setMeshRotationByNormalAndDirection(mesh, normal) {
  BABYLON.Vector3.CrossToRef(startRotation, normal, tmpVector1);
  BABYLON.Vector3.CrossToRef(tmpVector1, normal, tmpVector2);
  BABYLON.Vector3.RotationFromAxisToRef(tmpVector2.negate(), normal, tmpVector1, tmpVector3);
  BABYLON.Quaternion.RotationYawPitchRollToRef(
    tmpVector3.y,
    tmpVector3.x,
    tmpVector3.z,
    mesh.rotationQuaternion,
  );
}

// ---------------------------

/**
 *
 * @param q
 * @param prevNormal
 * @param nextNormal
 * @param ref
 */
export function rotateQuaternionByNormalChangeToRef(q, prevNormal, nextNormal, ref) {
  if (!prevNormal) {
    BABYLON.Quaternion.FromEulerVectorToRef(nextNormal, ref);
  } else {
    setFromUnitVectorsToRef(prevNormal, nextNormal, tmpQuaternion1);

    if (!isNaN(tmpQuaternion1.x)) {
      tmpQuaternion1.multiplyToRef(q, ref);
    }
  }
}

// ---------------------------

export function setDirectionToRef(normal, quaternion) {
  quaternion = quaternion || new BABYLON.Quaternion();

  tmpVector1.set(normal.z, 0, -normal.x).normalize();
  const radians = Math.acos(normal.y);

  quaternion = BABYLON.Quaternion.RotationAxisToRef(tmpVector1, radians, quaternion);

  return quaternion;
}
