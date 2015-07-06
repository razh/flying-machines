import THREE from 'three';

function createAsteroidMesh( x, y, z, radius ) {
  const geometry = new THREE.IcosahedronGeometry( radius, 2 );
  const material = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading
  });

  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( x, y, z );
  return mesh;
}

function createAsteroidMeshes( asteroids ) {
  return asteroids.map( asteroid => createAsteroidMesh( ...asteroid ) );
}

const maps = {
  minimal( scene ) {
    const meshes = createAsteroidMeshes([
      [ 0, 0, -8, 1 ],
      [ 4, -2, -4, 2 ]
    ]);

    scene.add( ...meshes );

    const light = new THREE.PointLight();
    light.position.set( 8, 8, 8 );
    scene.add( light );

    scene.add( new THREE.HemisphereLight( '#f43', '#33a', 0.5 ) );
  }
};

export default function createMap( scene, name ) {
  maps[ name ]( scene );
}
