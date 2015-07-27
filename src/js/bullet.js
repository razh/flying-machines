import THREE from 'three';
import Entity from './entity';
import { collisionMixin } from './collision';

const diameter = 128;
const radius = diameter / 2;

const canvas = document.createElement( 'canvas' );
const ctx = canvas.getContext( '2d' );

canvas.width = diameter;
canvas.height = diameter;

const gradient = ctx.createRadialGradient(
  radius, radius, 0,
  radius, radius, radius
);

gradient.addColorStop( 0, '#fff' );
gradient.addColorStop( 0.5, '#fff' );
gradient.addColorStop( 0.75, '#f43' );
gradient.addColorStop( 1, 'transparent' );

ctx.fillStyle = gradient;
ctx.fillRect( 0, 0, canvas.width, canvas.height );

const geometry = new THREE.PlaneBufferGeometry( 1, 1 );

const texture = new THREE.Texture( canvas );
texture.needsUpdate = true;

const material = new THREE.MeshBasicMaterial({
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  map: texture,
  side: THREE.DoubleSide,
  transparent: true
});

export default class Bullet extends Entity {
  constructor() {
    super( geometry, material );
    collisionMixin( this );

    this.type = 'bullet';
    this.scale.setLength( 1 / 16 );
  }
}
