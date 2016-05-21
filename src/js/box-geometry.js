import THREE from 'three';

// Vertices.
// Back-front order is reversed for the left side.
export const RIGHT_TOP_BACK     = 0;
export const RIGHT_TOP_FRONT    = 1;
export const RIGHT_BOTTOM_BACK  = 2;
export const RIGHT_BOTTOM_FRONT = 3;
export const LEFT_TOP_FRONT     = 4;
export const LEFT_TOP_BACK      = 5;
export const LEFT_BOTTOM_FRONT  = 6;
export const LEFT_BOTTOM_BACK   = 7;

// Edges.
export const RIGHT_TOP    = [ RIGHT_TOP_BACK, RIGHT_TOP_FRONT ];
export const RIGHT_BOTTOM = [ RIGHT_BOTTOM_BACK, RIGHT_BOTTOM_FRONT ];
export const LEFT_TOP     = [ LEFT_TOP_BACK, LEFT_TOP_FRONT ];
export const LEFT_BOTTOM  = [ LEFT_BOTTOM_BACK, LEFT_BOTTOM_FRONT ];

export const RIGHT_BACK  = [ RIGHT_TOP_BACK, RIGHT_BOTTOM_BACK ];
export const RIGHT_FRONT = [ RIGHT_TOP_FRONT, RIGHT_BOTTOM_FRONT ];
export const LEFT_FRONT  = [ LEFT_TOP_FRONT, LEFT_BOTTOM_FRONT ];
export const LEFT_BACK   = [ LEFT_TOP_BACK, LEFT_BOTTOM_BACK ];

export const TOP_BACK     = [ RIGHT_TOP_BACK, LEFT_TOP_BACK ];
export const TOP_FRONT    = [ RIGHT_TOP_FRONT, LEFT_TOP_FRONT ];
export const BOTTOM_BACK  = [ RIGHT_BOTTOM_BACK, LEFT_BOTTOM_BACK ];
export const BOTTOM_FRONT = [ RIGHT_BOTTOM_FRONT, LEFT_BOTTOM_FRONT ];

// Aliases for more idiomatic orderings.
export const TOP_RIGHT = RIGHT_TOP;
export const BOTTOM_RIGHT = RIGHT_BOTTOM;
export const TOP_LEFT = LEFT_TOP;
export const BOTTOM_LEFT = LEFT_BOTTOM;

export const BACK_RIGHT = RIGHT_BACK;
export const FRONT_RIGHT = RIGHT_FRONT;
export const FRONT_LEFT = LEFT_FRONT;
export const BACK_LEFT = LEFT_BACK;

// Faces.
export const RIGHT  = [ ...RIGHT_TOP, ...RIGHT_BOTTOM ];
export const LEFT   = [ ...LEFT_TOP, ...LEFT_BOTTOM ];
export const TOP    = [ ...RIGHT_TOP, ...LEFT_TOP ];
export const BOTTOM = [ ...RIGHT_BOTTOM, ...LEFT_BOTTOM ];
export const BACK   = [ ...RIGHT_BACK, ...LEFT_BACK ];
export const FRONT  = [ ...RIGHT_FRONT, ...LEFT_FRONT ];

export const Indices = {
  // Vertices.
  RIGHT_TOP_BACK,
  RIGHT_TOP_FRONT,
  RIGHT_BOTTOM_BACK,
  RIGHT_BOTTOM_FRONT,
  LEFT_TOP_FRONT,
  LEFT_TOP_BACK,
  LEFT_BOTTOM_FRONT,
  LEFT_BOTTOM_BACK,

  // Edges.
  RIGHT_TOP, RIGHT_BOTTOM, LEFT_TOP, LEFT_BOTTOM,
  RIGHT_BACK, RIGHT_FRONT, LEFT_FRONT, LEFT_BACK,
  TOP_BACK, TOP_FRONT, BOTTOM_BACK, BOTTOM_FRONT,

  TOP_RIGHT, BOTTOM_RIGHT, TOP_LEFT, BOTTOM_LEFT,
  BACK_RIGHT, FRONT_RIGHT, FRONT_LEFT, BACK_LEFT,

  // Faces.
  RIGHT,
  LEFT,
  TOP,
  BOTTOM,
  BACK,
  FRONT,
};

const vector = new THREE.Vector3();
const zero = new THREE.Vector3();

export function translate( geometry, vectors ) {
  Object.keys( vectors ).forEach( key => {
    const delta = vectors[ key ];
    const indices = Indices[ key.toUpperCase() ];

    if ( Array.isArray( delta ) ) {
      vector.fromArray( delta );
    } else if ( typeof delta === 'object' ) {
      Object.assign( vector, zero, delta );
    } else if ( typeof delta === 'number' ) {
      vector.setScalar( delta );
    } else {
      return;
    }

    if ( Array.isArray( indices ) ) {
      indices.forEach( index => {
        geometry.vertices[ index ].add( vector );
      });
    } else {
      geometry.vertices[ indices ].add( vector );
    }
  });

  return geometry;
}
