import THREE from 'three.js';

const vector = new THREE.Vector3();

const triangle = (() => {
  const canvas = document.createElement( 'canvas' );
  const ctx = canvas.getContext( '2d' );

  const size = 64;

  canvas.width = size;
  canvas.height = size;

  const radius = size / 2;
  const angle = 2 * Math.PI / 3;
  const x = radius * Math.cos( angle );
  const y = radius * Math.sin( angle );

  ctx.translate( radius, radius );
  ctx.moveTo( radius, 0 );
  ctx.lineTo( x, y );
  ctx.lineTo( x, -y );
  ctx.closePath();

  ctx.fillStyle = '#f43';
  ctx.fill();

  const texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  return new THREE.SpriteMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: false,
    map: texture
  });
})();

export default class Offscreen extends THREE.Sprite {
  constructor( camera ) {
    super( triangle.clone() );

    this.camera = camera;
    this.target = null;

    this.limit = 0.9;
    this.scale.set( 1 / 16, 1 / 16, 0 );
  }

  update() {
    if ( !this.target ) {
      return;
    }

    // Check if target is outside of camera.
    vector.copy( this.target.position ).project( this.camera );

    const visible = (
      -1 <= vector.x && vector.x <= 1 &&
      -1 <= vector.y && vector.y <= 1
    );

    this.visible = !visible;
    if ( visible ) {
      return;
    }

    if ( vector.z > 1 ) {
      this.visible = false;
      return;
    }

    const angle = Math.atan2( vector.y, vector.x / this.camera.aspect );
    this.material.rotation = angle;

    vector.z = 0;
    vector.clampLength( 0, this.limit );
    vector.z = this.limit;

    vector.unproject( this.camera );
    this.position.copy( vector );
  }
}
