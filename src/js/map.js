import THREE from 'three';
import Turret from './turret';

function createAsteroidMesh( x = 0, y = 0, z = 0, radius = 1, detail = 2 ) {
  const geometry = new THREE.IcosahedronGeometry( radius, detail );
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

    const turret = new Turret();
    turret.position.set( 4, -0.02, -4 );
    scene.add( turret );
  },

  minimalSkybox( scene ) {
    const matrix = new THREE.Matrix4();

    const radius = 32;
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    let count = 32;
    const geometry = new THREE.IcosahedronGeometry( 1, 1 );
    const asteroidBeltGeometry = new THREE.Geometry();

    while ( count-- ) {
      const angle = Math.random() * 2 * Math.PI;

      position.set(
        radius * Math.cos( angle ) + THREE.Math.randFloatSpread( 8 ),
        radius * Math.sin( angle ) + THREE.Math.randFloatSpread( 8 ),
        THREE.Math.randFloatSpread( 8 )
      );

      quaternion.set( Math.random(), Math.random(), Math.random(), 1 )
        .normalize();

      scale.set(
        1 + THREE.Math.randFloatSpread( 0.5 ),
        1 + THREE.Math.randFloatSpread( 0.5 ),
        1 + THREE.Math.randFloatSpread( 0.5 )
      );

      matrix.compose( position, quaternion, scale );
      asteroidBeltGeometry.merge( geometry, matrix );
    }

    asteroidBeltGeometry.computeFaceNormals();
    asteroidBeltGeometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      color: '#655'
    });

    scene.add( new THREE.DirectionalLight() );

    const mesh = new THREE.Mesh( asteroidBeltGeometry, material );
    mesh.rotation.x = -Math.PI / 3;
    mesh.rotation.y = Math.PI / 4;
    scene.add( mesh );
  }
};

export default function createMap( scene, name ) {
  maps[ name ]( scene );
}
