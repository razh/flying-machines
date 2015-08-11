import THREE from 'three';
import TWEEN from 'tween.js';
import Entity from './entity';
import traverse from './traverse';

const TorusKnot = THREE.Curve.create(
  function TorusKnot( scale = 10 ) {
    this.scale = scale;
  },

  function getPoint( t ) {
    const p = 3;
    const q = 4;

    t *= 2 * Math.PI;

    const tx = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
    const ty = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
    const tz = Math.sin( q * t );

    return new THREE.Vector3( tx, ty, tz )
      .multiplyScalar( this.scale );
  }
);

const geometry = new THREE.IcosahedronGeometry( 0.2 );
const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

const vector = new THREE.Vector3();

export default class Drone extends Entity {
  constructor() {
    super( geometry, material.clone() );
    this.geometry.computeBoundingSphere();

    this.type = 'drone';

    this.path = new TorusKnot( 2 );
    this.length = this.path.getLength();
    this.speed = 2;
    this.duration = this.length / this.speed;

    this.clock = new THREE.Clock();

    const { color } = this.material;
    this.colorArray = material.color.toArray();

    this.tween = new TWEEN.Tween( this.colorArray )
      .onUpdate(function() {
        color.setRGB( ...this );
      })
      .start();
  }

  hit() {
    this.material.color.setRGB( 1, 0, 0 )
      .toArray( this.colorArray );

    this.tween.stop()
      .to( [ 1, 1, 1 ], 100 )
      .start();
    }

  update( dt, scene ) {
    TWEEN.update();

    const t = ( this.clock.getElapsedTime() / this.duration ) % 1;
    const point = this.path.getPointAt( t );

    this.velocity
      .subVectors( point, this.position )
      .divideScalar( dt );

    this.position.copy( point );

    traverse( scene, object => {
      if ( object.type === 'bullet' ) {
        this.worldToLocal( object.getWorldPosition( vector ) );
        if ( this.geometry.boundingSphere.containsPoint( vector ) ) {
          this.hit();
          return false;
        }
      }
    });
  }
}
