export default function update( scene, dt, callback ) {
  scene.traverse( object => {
    if ( object.update ) {
      object.update( dt, scene );
    }

    if ( callback ) {
      callback( object );
    }
  });
}
