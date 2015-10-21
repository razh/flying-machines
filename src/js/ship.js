import THREE from 'three.js';
import Entity from './entity';
import Shield from './shield';
import { collisionMixin } from './collision';

const geometries = {
  basic: (() => {
    const geometry = new THREE.CylinderGeometry( 0, 0.1, 0.5, 3 );

    geometry.rotateX( -Math.PI / 2 );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  })(),

  sphere: new THREE.IcosahedronGeometry( 0.2, 2 )
};

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

const sphere = new THREE.Sphere();

export default class Ship extends Entity {
  constructor() {
    super( geometries.basic, material.clone() );
    collisionMixin( this );

    this.type = 'ship';

    this.shield = new Shield();
    this.shield.visible = false;
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
