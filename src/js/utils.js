export function remove( object ) {
  if ( object.parent ) {
    object.parent.remove( object );
  }
}
