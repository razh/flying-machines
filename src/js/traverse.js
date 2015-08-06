// Similar to THREE.Object3D.prototype.traverse, but with the addition of an
// early exit.
export default function traverse( object, callback ) {
  if ( callback( object ) === false ) {
    return;
  }

  for ( var i = 0, l = object.children.length; i < l; i++ ) {
    if ( object.children[ i ].traverse( callback ) === false ) {
      return;
    }
  }
}
