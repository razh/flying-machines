import * as THREE from 'three';

// Vertices.
// pz-nz order is reversed for the nx side.
export const PX_PY_PZ = [ 0 ];
export const PX_PY_NZ = [ 1 ];
export const PX_NY_PZ = [ 2 ];
export const PX_NY_NZ = [ 3 ];
export const NX_PY_NZ = [ 4 ];
export const NX_PY_PZ = [ 5 ];
export const NX_NY_NZ = [ 6 ];
export const NX_NY_PZ = [ 7 ];

// Edges.
export const PX_PY = [].concat( PX_PY_PZ, PX_PY_NZ );
export const PX_NY = [].concat( PX_NY_PZ, PX_NY_NZ );
export const NX_PY = [].concat( NX_PY_NZ, NX_PY_PZ );
export const NX_NY = [].concat( NX_NY_NZ, NX_NY_PZ );

export const PX_PZ = [].concat( PX_PY_PZ, PX_NY_PZ );
export const PX_NZ = [].concat( PX_PY_NZ, PX_NY_NZ );
export const NX_NZ = [].concat( NX_PY_NZ, NX_NY_NZ );
export const NX_PZ = [].concat( NX_PY_PZ, NX_NY_PZ );

export const PY_PZ = [].concat( PX_PY_PZ, NX_PY_PZ );
export const PY_NZ = [].concat( PX_PY_NZ, NX_PY_NZ );
export const NY_PZ = [].concat( PX_NY_PZ, NX_NY_PZ );
export const NY_NZ = [].concat( PX_NY_NZ, NX_NY_NZ );

// Faces.
export const PX = [].concat( PX_PY, PX_NY );
export const NX = [].concat( NX_PY, NX_NY );
export const PY = [].concat( PX_PY, NX_PY );
export const NY = [].concat( PX_NY, NX_NY );
export const PZ = [].concat( PX_PZ, NX_PZ );
export const NZ = [].concat( PX_NZ, NX_NZ );

// Vertices.
// Front-back order is reversed for the left side.
export const RIGHT_TOP_FRONT    = [ 0 ];
export const RIGHT_TOP_BACK     = [ 1 ];
export const RIGHT_BOTTOM_FRONT = [ 2 ];
export const RIGHT_BOTTOM_BACK  = [ 3 ];
export const LEFT_TOP_BACK      = [ 4 ];
export const LEFT_TOP_FRONT     = [ 5 ];
export const LEFT_BOTTOM_BACK   = [ 6 ];
export const LEFT_BOTTOM_FRONT  = [ 7 ];

// Edges.
export const RIGHT_TOP    = [].concat( RIGHT_TOP_FRONT, RIGHT_TOP_BACK );
export const RIGHT_BOTTOM = [].concat( RIGHT_BOTTOM_FRONT, RIGHT_BOTTOM_BACK );
export const LEFT_TOP     = [].concat( LEFT_TOP_BACK, LEFT_TOP_FRONT );
export const LEFT_BOTTOM  = [].concat( LEFT_BOTTOM_BACK, LEFT_BOTTOM_FRONT );

export const RIGHT_FRONT = [].concat( RIGHT_TOP_FRONT, RIGHT_BOTTOM_FRONT );
export const RIGHT_BACK  = [].concat( RIGHT_TOP_BACK, RIGHT_BOTTOM_BACK );
export const LEFT_FRONT  = [].concat( LEFT_TOP_FRONT, LEFT_BOTTOM_FRONT );
export const LEFT_BACK   = [].concat( LEFT_TOP_BACK, LEFT_BOTTOM_BACK );

export const TOP_FRONT    = [].concat( RIGHT_TOP_FRONT, LEFT_TOP_FRONT );
export const TOP_BACK     = [].concat( RIGHT_TOP_BACK, LEFT_TOP_BACK );
export const BOTTOM_FRONT = [].concat( RIGHT_BOTTOM_FRONT, LEFT_BOTTOM_FRONT );
export const BOTTOM_BACK  = [].concat( RIGHT_BOTTOM_BACK, LEFT_BOTTOM_BACK );

// Faces.
export const RIGHT  = [].concat( RIGHT_TOP, RIGHT_BOTTOM );
export const LEFT   = [].concat( LEFT_TOP, LEFT_BOTTOM );
export const TOP    = [].concat( RIGHT_TOP, LEFT_TOP );
export const BOTTOM = [].concat( RIGHT_BOTTOM, LEFT_BOTTOM );
export const FRONT  = [].concat( RIGHT_FRONT, LEFT_FRONT );
export const BACK   = [].concat( RIGHT_BACK, LEFT_BACK );

export const VertexIndices = {
  // Vertices.
  PX_PY_PZ,
  PX_PY_NZ,
  PX_NY_PZ,
  PX_NY_NZ,
  NX_PY_NZ,
  NX_PY_PZ,
  NX_NY_NZ,
  NX_NY_PZ,

  // Edges.
  PX_PY,
  PX_NY,
  NX_PY,
  NX_NY,

  PX_PZ,
  PX_NZ,
  NX_NZ,
  NX_PZ,

  PY_PZ,
  PY_NZ,
  NY_PZ,
  NY_NZ,

  // Faces.
  PX,
  NX,
  PY,
  NY,
  PZ,
  NZ,

  // Vertices.
  RIGHT_TOP_FRONT,
  RIGHT_TOP_BACK,
  RIGHT_BOTTOM_FRONT,
  RIGHT_BOTTOM_BACK,
  LEFT_TOP_BACK,
  LEFT_TOP_FRONT,
  LEFT_BOTTOM_BACK,
  LEFT_BOTTOM_FRONT,

  // Edges.
  RIGHT_TOP,
  RIGHT_BOTTOM,
  LEFT_TOP,
  LEFT_BOTTOM,

  RIGHT_FRONT,
  RIGHT_BACK,
  LEFT_BACK,
  LEFT_FRONT,

  TOP_FRONT,
  TOP_BACK,
  BOTTOM_FRONT,
  BOTTOM_BACK,

  // Edge aliases.
  TOP_RIGHT: RIGHT_TOP,
  BOTTOM_RIGHT: RIGHT_BOTTOM,
  TOP_LEFT: LEFT_TOP,
  BOTTOM_LEFT: LEFT_BOTTOM,

  FRONT_RIGHT: RIGHT_FRONT,
  BACK_RIGHT: RIGHT_BACK,
  BACK_LEFT: LEFT_BACK,
  FRONT_LEFT: LEFT_FRONT,

  // Faces.
  RIGHT,
  LEFT,
  TOP,
  BOTTOM,
  FRONT,
  BACK,
};

const vector = new THREE.Vector3();
const zero = new THREE.Vector3();

export function translate( geometry, vectors ) {
  Object.keys( vectors ).forEach( key => {
    const delta = vectors[ key ];
    const indices = VertexIndices[ key.toUpperCase() ];

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
    }
  });

  return geometry;
}
