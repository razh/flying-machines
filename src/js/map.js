import THREE from 'three.js';
import Nebula from './nebula';
import Starfield from './starfield';
import Sun, { textures as sunTextures } from './sun';
import Turret from './turret';
import greeble from './greeble';
import { collisionMixin, CollisionShapes } from './collision';

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

  collisionMixin( mesh );
  mesh.type = 'asteroid';
  mesh.shape = CollisionShapes.SPHERE;

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

    maps.sunLensFlare( scene );
  },

  sunLensFlare( scene ) {
    const sun = new Sun();
    sun.position.copy( minimal.pointLight.position ).setLength( 64 );
    scene.add( sun );
  },

  sunSprite( scene ) {
    const coreMaterial = new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      map: sunTextures.core
    });

    const core = new THREE.Sprite( coreMaterial );
    core.position.copy( minimal.pointLight.position ).setLength( 64 );
    core.scale.setLength( 16 );

    scene.add( core );
  },

  artifacts( scene ) {
    const artifactGeometry = greeble( new THREE.BoxGeometry( 16, 1, 1 ), {
      count: 100,
      greeble() {
        return new THREE.BoxGeometry(
          THREE.Math.randFloat( 0.5, 2 ),
          THREE.Math.randFloat( 0.5, 2 ),
          THREE.Math.randFloat( 0.5, 2 )
        );
      }
    });

    const artifact = new THREE.Mesh( artifactGeometry, new THREE.MeshPhongMaterial({
      color: '#333',
      shininess: 10
    }));

    artifact.position.set( -4, 4, -4 );
    artifact.rotation.z = Math.PI / 4;

    scene.add( artifact );
  },

  minimalSkybox( scene ) {
    scene.add( minimal.pointLight.clone() );
    scene.add( minimal.hemisphereLight.clone() );

    // Asteroid belt.
    const radius = 32;
    const positionSpread = 8;
    const scaleSpread = 0.5;

    scene.fog = new THREE.Fog(
      '#000',
      radius - positionSpread,
      radius + positionSpread
    );

    let count = 32;
    const asteroidGeometry = new THREE.IcosahedronGeometry( 1, 1 );
    const asteroidBeltGeometry = new THREE.Geometry();

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const matrix = new THREE.Matrix4();

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

    const mesh = new THREE.Mesh( asteroidBeltGeometry, material );
    mesh.rotation.x = -2 * Math.PI / 3;
    mesh.rotation.y = Math.PI / 4;
    scene.add( mesh );

    // Nebula.
    const nebulaGeometry = new Nebula(
      new THREE.IcosahedronGeometry( 64, 3 ),
      {
        period: 64,
        fromColor: new THREE.Color( '#223' ),
        toColor: new THREE.Color( '#000' )
      }
    );

    const nebulaMesh = new THREE.Mesh(
      nebulaGeometry,
      new THREE.MeshBasicMaterial({
        fog: false,
        side: THREE.BackSide,
        vertexColors: THREE.VertexColors,
        depthWrite: false
      })
    );

    scene.add( nebulaMesh );

    // Starfield.
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
