import { Vector3 } from 'three';

export function randomPointOnSphere( vector = new Vector3() ) {
  const theta = 2 * Math.PI * Math.random();
  const u = 2 * Math.random() - 1;
  const v = Math.sqrt( 1 - u * u );

  return vector.set(
    v * Math.cos( theta ),
    v * Math.sin( theta ),
    u
  );
}

export function lerp( a, b, t ) {
  return a + t * ( b - a );
}

export function inverseLerp( a, b, x ) {
  return ( x - a ) / ( b - a );
}

/*
  Returns a function that invokes the callback on a vector, passing in the
  position of the vector relative to the geometry bounding box, where
  [ 0, 0, 0 ] is the center and extrema are in [ -1, 1 ].

  For example, [ -1, 0, 0 ] if the vector is on the left face of the bounding
  box, [ 0, 1, 0 ] if on the top face, etc.

  The callback is invoked with four arguments: (vector, xt, yt, zt).
 */
export function parametric( geometry, callback ) {
  geometry.computeBoundingBox();

  const { min, max } = geometry.boundingBox;

  return vector => {
    callback(
      vector,
      2 * inverseLerp( min.x, max.x, vector.x ) - 1,
      2 * inverseLerp( min.y, max.y, vector.y ) - 1,
      2 * inverseLerp( min.z, max.z, vector.z ) - 1
    );
  };
}
