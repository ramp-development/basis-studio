export const UpdateGeometry = (mesh, geometry) => {
  mesh.geometry.dispose();
  mesh.geometry = geometry;
};
