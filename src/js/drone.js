import THREE from 'three';
import Entity from './entity';

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

export default class Drone extends Entity {
  constructor() {
    super( geometry, material.clone() );

    this.path = new TorusKnot( 2 );

    this.length = this.path.getLength();
    this.speed = 2;
    this.duration = this.length / this.speed;

    this.clock = new THREE.Clock();
  }

  update() {
    const t = ( this.clock.getElapsedTime() / this.duration ) % 1;
    this.position.copy( this.path.getPointAt( t ) );
  }
}
