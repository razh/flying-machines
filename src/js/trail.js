import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

const vector = new THREE.Vector3();

export class MeshLineTrail extends THREE.Mesh {
  constructor( offset = new THREE.Vector3(), count = 32 ) {
    const geometry = new THREE.Geometry();

    for (let i = 0; i < count; i++) {
      geometry.vertices.push( offset.clone() );
    }

    const material = new MeshLineMaterial({
      blending: THREE.AdditiveBlending,
      color: new THREE.Color( '#f43' ),
      resolution: new THREE.Vector2( window.innerWidth, window.innerHeight ),
      sizeAttenuation: true,
      lineWidth: 0.025,
      transparent: true,
      opacity: 0.5,
      depthTest: false,
    });

    const line = new MeshLine();
    line.setGeometry( geometry, p =>
      p > 0.95
        ? THREE.Math.mapLinear( p, 1, 0.95, 0, 1 )
        : THREE.Math.mapLinear( p, 0.95, 0, 1, 0 )
    );

    super( line.geometry, material );

    this.line = line;
    this.frustumCulled = false;

    // Offset from target.
    this.offset = offset;
  }

  advance( target ) {
    vector.copy( this.offset )
      .applyQuaternion( target.quaternion )
      .add( target.position );

    this.line.advance( vector );
  }
}
