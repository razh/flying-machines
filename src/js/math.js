import THREE from 'three';

export function randomPointOnSphere( vector = new THREE.Vector3() ) {
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

export function map( x, a, b, c, d ) {
  return lerp( c, d, inverseLerp( a, b, x ) );
}
