import THREE from 'three';

const vector = new THREE.Vector3();

export default function update( scene, dt, callback ) {
  scene.traverse( object => {
    if ( object.update ) {
      object.update();
    }

    if ( object.type === 'bullet' ) {
      vector.copy( object.velocity ).multiplyScalar( dt );
      object.position.add( vector );
    }

    if ( callback ) {
      callback( object );
    }
  });
}
