import THREE from 'three';

const diameter = 32;
const radius   = diameter / 2;

const canvas = document.createElement( 'canvas' );
const ctx    = canvas.getContext( '2d' );

canvas.width = diameter;
canvas.height = diameter;

ctx.fillStyle = '#fff';
ctx.arc( radius, radius, radius, 0, 2 * Math.PI );
ctx.fill();

const map = new THREE.Texture( canvas );
map.needsUpdate = true;

const material = new THREE.SpriteMaterial({ map });

export default class Bullet extends THREE.Sprite {
  constructor() {
    super( material );
    this.type = 'Bullet';
    this.velocity = new THREE.Vector3();
    this.scale.setLength( 1 / radius );
  }
}
