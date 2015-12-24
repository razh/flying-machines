export function defineLazyGetter( object, key, fn ) {
  let value;

  return Object.defineProperty( object, key, {
    get() {
      if ( !value ) {
        value = fn();
      }

      return value;
    }
  });
}

export function defineLazyGetters( target, source ) {
  return Object.keys( source ).reduce( ( object, key ) => {
    return defineLazyGetter( target, key, source[ key ] );
  }, target );
}
