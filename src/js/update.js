import THREE from 'three';

export default function update( scene, dt, callback ) {
  scene.traverse( object => {
    if ( object.update ) {
      object.update( dt );
    }

    if ( callback ) {
      callback( object );
    }
  });
}
