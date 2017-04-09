import * as THREE from 'three';
import { ASTEROID } from './types';
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
    shading: THREE.FlatShading,
  });

  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( x, y, z );

  collisionMixin( mesh );
  mesh.type = ASTEROID;
  mesh.shape = CollisionShapes.SPHERE;

  return mesh;
}

function createAsteroidMeshes( asteroids ) {
  return asteroids.map( asteroid => createAsteroidMesh( ...asteroid ) );
}

const minimal = {
  pointLight: (() => {
    const light = new THREE.PointLight( '#aaf' );
    light.position.set( 128, 128, 128 );
    return light;
  })(),

  hemisphereLight: new THREE.HemisphereLight( '#d43', '#33a', 0.5 ),
};

const maps = {
  minimal( scene ) {
    const meshes = createAsteroidMeshes([
      [ 0, 0, -128, 16 ],
      [ 64, -32, -64, 32 ],
    ]);

    scene.add( ...meshes );

    scene.add( minimal.pointLight.clone() );
    scene.add( minimal.hemisphereLight.clone() );

    const turret = new Turret();
    turret.position.set( 64, -0.32, -64 );
    scene.add( turret );

    maps.sunLensFlare( scene );
  },

  sunLensFlare( scene ) {
    const sun = new Sun();
    sun.position.copy( minimal.pointLight.position ).setLength( 1024 );
    scene.add( sun );
  },

  sunSprite( scene ) {
    const coreMaterial = new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      map: sunTextures.core,
    });

    const core = new THREE.Sprite( coreMaterial );
    core.position.copy( minimal.pointLight.position ).setLength( 1024 );
    core.scale.setLength( 16 );

    scene.add( core );
  },

  artifacts( scene ) {
    const baseGeometry = new THREE.BoxGeometry( 256, 16, 16 )
      .translate( 0, 80, 0 );

    baseGeometry.merge( new THREE.BoxGeometry( 192, 16, 16 ) );

    const artifactGeometry = greeble( baseGeometry, {
      count: 100,
      greeble() {
        return new THREE.BoxGeometry(
          THREE.Math.randFloat( 8, 32 ),
          THREE.Math.randFloat( 8, 32 ),
          THREE.Math.randFloat( 8, 32 )
        );
      },
    });

    artifactGeometry.computeFaceNormals();
    artifactGeometry.computeVertexNormals();

    const artifact = new THREE.Mesh( artifactGeometry, new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      color: '#333',
      shininess: 10,
    }));

    artifact.position.set( -64, 64, -64 );
    artifact.rotation.z = Math.PI / 4;

    scene.add( artifact );
  },

  minimalSkybox( scene ) {
    scene.add( minimal.pointLight.clone() );
    scene.add( minimal.hemisphereLight.clone() );

    // Asteroid belt.
    const radius = 512;
    const positionSpread = 128;
    const scaleSpread = 8;

    scene.fog = new THREE.Fog(
      '#000',
      radius - positionSpread,
      radius + positionSpread
    );

    const asteroidBelt = new THREE.Group();
    const asteroidGeometry = new THREE.IcosahedronGeometry( 1, 1 );

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const matrix = new THREE.Matrix4();

    const material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      color: '#655',
    });

    let count = 32;
    while ( count-- ) {
      const geometry = new THREE.Geometry().copy( asteroidGeometry );
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
        16 + THREE.Math.randFloatSpread( scaleSpread ),
        16 + THREE.Math.randFloatSpread( scaleSpread ),
        16 + THREE.Math.randFloatSpread( scaleSpread )
      );

      matrix.compose( position, quaternion, scale );
      geometry.applyMatrix( matrix );

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      asteroidBelt.add( new THREE.Mesh( geometry, material ) );
    }

    asteroidBelt.rotation.x = -2 * Math.PI / 3;
    asteroidBelt.rotation.y = Math.PI / 4;
    scene.add( asteroidBelt );

    // Nebula.
    const nebulaGeometry = new Nebula(
      new THREE.IcosahedronBufferGeometry( 1024, 3 ),
      {
        period: 1024,
        fromColor: new THREE.Color( '#223' ),
        toColor: new THREE.Color( '#000' ),
      }
    );

    const nebulaMesh = new THREE.Mesh(
      nebulaGeometry,
      new THREE.MeshBasicMaterial({
        fog: false,
        side: THREE.BackSide,
        vertexColors: THREE.VertexColors,
        depthWrite: false,
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
        sizeAttenuation: false,
        vertexColors: THREE.VertexColors,
      })
    );

    starfield.scale.setLength( 1008 );
    scene.add( starfield );
  },
};

export default function createMap( scene, name ) {
  maps[ name ]( scene );
}
