import THREE from 'three.js';
import Nebula from './nebula';
import Starfield from './starfield';
import Turret from './turret';

function perturbVertex( vertex ) {
  return vertex.multiplyScalar( THREE.Math.randFloat( 1, 1.5 ) );
}

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

const minimal = {
  pointLight: (() => {
    const light = new THREE.PointLight( '#aaf' );
    light.position.set( 8, 8, 8 );
    return light;
  })(),

  hemisphereLight: new THREE.HemisphereLight( '#d43', '#33a', 0.5 )
};

const maps = {
  minimal( scene ) {
    const meshes = createAsteroidMeshes([
      [ 0, 0, -8, 1 ],
      [ 4, -2, -4, 2 ]
    ]);

    scene.add( ...meshes );

    scene.add( minimal.pointLight.clone() );
    scene.add( minimal.hemisphereLight.clone() );

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
    const asteroidGeometry = new THREE.IcosahedronGeometry( 1, 1 );
    const asteroidBeltGeometry = new THREE.Geometry();

    const positionSpread = 8;
    const scaleSpread = 0.5;

    scene.fog = new THREE.Fog(
      '#000',
      radius - positionSpread,
      radius + positionSpread
    );

    while ( count-- ) {
      const geometry = asteroidGeometry.clone();
      geometry.vertices.forEach( perturbVertex );

      const angle = 2 * Math.PI * Math.random();

      position.set(
        radius * Math.cos( angle ) + THREE.Math.randFloatSpread( positionSpread ),
        radius * Math.sin( angle ) + THREE.Math.randFloatSpread( positionSpread ),
        THREE.Math.randFloatSpread( positionSpread )
      );

      quaternion.set( Math.random(), Math.random(), Math.random(), 1 )
        .normalize();

      scale.set(
        1 + THREE.Math.randFloatSpread( scaleSpread ),
        1 + THREE.Math.randFloatSpread( scaleSpread ),
        1 + THREE.Math.randFloatSpread( scaleSpread )
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

    scene.add( minimal.pointLight.clone() );
    scene.add( minimal.hemisphereLight.clone() );

    const mesh = new THREE.Mesh( asteroidBeltGeometry, material );
    mesh.rotation.x = -2 * Math.PI / 3;
    mesh.rotation.y = Math.PI / 4;
    scene.add( mesh );

    const nebulaGeometry = new Nebula(
      {
        fromColor: new THREE.Color( '#223' ),
        toColor: new THREE.Color( '#000' )
      },
      64, 3
    );

    const nebulaMesh = new THREE.Mesh(
      nebulaGeometry,
      new THREE.MeshBasicMaterial({
        fog: false,
        side: THREE.BackSide,
        vertexColors: THREE.VertexColors
      })
    );

    scene.add( nebulaMesh );

    const starfieldGeometry = new Starfield( 512 );
    const starfield = new THREE.Points(
      starfieldGeometry,
      new THREE.PointsMaterial({
        color: '#777',
        fog: false,
        sizeAttenuation: false
      })
    );

    starfield.scale.setLength( 63 );
    scene.add( starfield );
  }
};

export default function createMap( scene, name ) {
  maps[ name ]( scene );
}
