import THREE from 'three';
import Entity from './entity';
import Shield from './shield';
import { collisionMixin } from './collision';

const rotationMatrix = new THREE.Matrix4()
  .makeRotationFromEuler( new THREE.Euler( -Math.PI / 2, 0, 0 ) );

const geometry = new THREE.CylinderGeometry( 0, 0.1, 0.5, 3 );
geometry.applyMatrix( rotationMatrix );
geometry.computeFaceNormals();
geometry.computeVertexNormals();

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

const sphere = new THREE.Sphere();

export default class Ship extends Entity {
  constructor() {
    super( geometry, material.clone() );
    collisionMixin( this );

    this.type = 'ship';

    this.shield = new Shield();
    this.add( this.shield );
  }

  containsPoint( point ) {
    if ( !this.geometry.boundingSphere ) {
      this.geometry.computeBoundingSphere();
    }

    return sphere.copy( this.geometry.boundingSphere )
      .applyMatrix( this.matrixWorld )
      .containsPoint( point );
  }
}
