import THREE from 'three.js';

/**
 * Copies of various utility functions from THREE.GeometryUtils.
 */
const triangleArea = (() => {
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();

  return ( vA, vB, vC ) => {
    ab.subVectors( vB, vA ),
    ac.subVectors( vC, vA )
    ab.cross( ac );

    return 0.5 * ab.length();
  };
})();

function randomPointInTriangle( vA, vB, vC ) {
  const a = THREE.Math.random16();
  const b = THREE.Math.random16();

  if ( ( a + b ) > 1 ) {
    a = 1 - a;
    b = 1 - b;
  }

  const c = 1 - a - b;

  return new THREE.Vector3()
    .addScaledVector( vA, a )
    .addScaledVector( vB, b )
    .addScaledVector( vC, c );
}

function randomPointInFace( face, geometry ) {
  const vA = geometry.vertices[ face.a ];
  const vB = geometry.vertices[ face.b ];
  const vC = geometry.vertices[ face.c ];

  return randomPointInTriangle( vA, vB, vC );
}

/**
 * Similar to THREE.GeometryUtils.randomPointsInGeometry().
 *
 * Returns an object containing an array of points and an array of
 * corresponding face normals.
 *
 * @param  {THREE.Geometry} geometry
 * @param  {Number} count
 * @return {Object}
 */
function randomPointsNormalsInGeometry( geometry, count ) {
  const { faces, vertices } = geometry;

  let totalArea = 0;
  const cumulativeAreas = [];

  for ( let i = 0, il = faces.length; i < il; i++ ) {
    const face = faces[i];

    const vA = vertices[ face.a ];
    const vB = vertices[ face.b ];
    const vC = vertices[ face.c ];

    totalArea += triangleArea( vA, vB, vC );
    cumulativeAreas[i] = totalArea;
  }

  function binarySearchIndices( value ) {
    function binarySearch( start, end ) {
      if ( end < start ) {
        return start;
      }

      const mid = start + Math.floor( ( end - start ) / 2 );

      if ( cumulativeAreas[ mid ] > value ) {
        return binarySearch( start, mid - 1 );
      } else if ( cumulativeAreas[ mid ] < value ) {
        return binarySearch( mid + 1, end );
      } else {
        return mid;
      }
    }

    return binarySearch( 0, cumulativeAreas.length - 1 );
  }

  const points = [];
  const normals = [];

  for ( let i = 0; i < count; i++ ) {
    const r = THREE.Math.random16() * totalArea;
    const index = binarySearchIndices( r );

    const face = faces[ index ];
    points[i] = randomPointInFace( face, geometry, true );
    normals[i] = face.normal;
  }

  return { points, normals };
}


const matrix = new THREE.Matrix4();
const origin = new THREE.Vector3();
const up = new THREE.Vector3( 0, 1, 0 );

const emptyGeometry = new THREE.Geometry();

export default function greeble( geometry, {
  count = 0,
  greeble = () => emptyGeometry
} = {} ) {
  const greebles = new THREE.Geometry();

  const { points, normals } = randomPointsNormalsInGeometry( geometry, count );

  points.forEach(( point, index ) => {
    const normal = normals[ index ];

    // Get orientation and position.
    matrix.identity()
      .lookAt( origin, normal, up )
      .setPosition( point );

    greebles.merge( greeble(), matrix );
  });

  return greebles;
}