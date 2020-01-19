import * as BABYLON from 'babylonjs';

export function showNormals(mesh, size, color, scene) {
  const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  color = color || BABYLON.Color3.White();
  size = size || 1;

  const lines = [];
  for (let i = 0; i < normals.length; i += 3) {
    const v1 = BABYLON.Vector3.FromArray(positions, i);
    const v2 = v1.add(BABYLON.Vector3.FromArray(normals, i).scaleInPlace(size));
    lines.push([v1.add(mesh.position), v2.add(mesh.position)]);
  }
  const normalLines = BABYLON.MeshBuilder.CreateLineSystem('normalLines', { lines }, scene);
  normalLines.color = color;
  return normalLines;
}
