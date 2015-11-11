import THREE from 'three.js';

export function collisionMixin( body ) {
  body.collides = true;
  body.collisionFilterGroup = 1;
  body.collisionFilterMask = 1;
  return body;
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

export function findNearest( scene, target, callback ) {
  let minDistanceSquared = Infinity;
  let min;

  scene.traverse( object => {
    if ( object === target ) {
      return;
    }

    if ( callback && !callback( object ) ) {
      return;
    }

    const distanceSquared = object.position
      .distanceToSquared( target.position );

    if ( distanceSquared < minDistanceSquared ) {
      minDistanceSquared = distanceSquared;
      min = object;
    }
  });

  return min;
}

export function collide( scene, callback ) {
  const colliders = [];

  scene.traverse( object => {
    if ( object.collides ) {
      colliders.push( object );
    }
  });

  for ( let i = 0; i < colliders.length; i++ ) {
    const a = colliders[i];

    for ( let j = i; j < colliders.length; j++ ) {
      const b = colliders[j];

      if ( a.type === 'bullet' && b.type === 'bullet') {
        continue;
      }

      if ( a.type === 'bullet' || b.type === 'bullet' ) {
        callback( a, b );
      }
    }
  }
}
