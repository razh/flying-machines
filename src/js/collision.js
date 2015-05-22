import THREE from 'three';

export function collisionMixin( object ) {
  object.collisionFilterGroup = 1;
  object.collisionFilterMask = 1;
}

export const intersectLineSphere = (() => {
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();

  return function intersectLineSphere( line, sphere ) {
    line.delta( v0 );
    v1.subVectors( line.start, sphere.center );

    const a = v0.lengthSq();
    const b = 2 * v0.dot( v1 );
    const c = v1.lengthSq() - sphere.radius * sphere.radius;

    const d = b * b - 4 * a * c;
    if ( d < 0 ) {
      return;
    } else if ( !d ) {
      return line.at( d );
    } else {
      const t0 = ( -b - Math.sqrt( d ) ) / ( 2 * a );
      const t1 = ( -b + Math.sqrt( d ) ) / ( 2 * a );

      return [
        line.at( t0 ),
        line.at( t1 )
      ];
    }
  };
})();
