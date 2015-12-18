import THREE from 'three.js';

const textures = {
  core: (() => {
    const diameter = 512;
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
    gradient.addColorStop( 0.1, '#fff' );
    gradient.addColorStop( 0.3, '#ffd' );
    // rgba(#f83, 0.2).
    gradient.addColorStop( 0.7, 'rgba(255, 136, 51, 0.2)' );
    gradient.addColorStop( 1, 'transparent' );

    ctx.fillStyle = gradient;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    const texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;
    return texture;
  })(),

  lensFlare: (() => {
    const sides = 6;

    const diameter = 256;
    const radius = diameter / 2;

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    canvas.width = diameter;
    canvas.height = diameter;

    const gradient = ctx.createRadialGradient(
      radius, radius, 0,
      radius, radius, radius
    );

    gradient.addColorStop( 0, 'rgba(255, 255, 255, 0.5)' );
    gradient.addColorStop( 0.5, 'rgba(255, 255, 255, 0.4)' );
    gradient.addColorStop( 1, 'transparent' );

    ctx.fillStyle = gradient;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    const texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;
    return texture;
  })()
};

export default class Sun extends THREE.Group {
  constructor( ...args ) {
    super( ...args );

    const lensFlare = new THREE.LensFlare();

    lensFlare.add( textures.core, 64, 0, THREE.AdditiveBlending );
    lensFlare.add( textures.lensFlare, 64, 0.5, THREE.AdditiveBlending, undefined, 0.1 );
    lensFlare.add( textures.lensFlare, 96, 0.7, THREE.AdditiveBlending, undefined, 0.1 );
    lensFlare.add( textures.lensFlare, 128, 0.9, THREE.AdditiveBlending, undefined, 0.1 );
    lensFlare.add( textures.lensFlare, 96, 1, THREE.AdditiveBlending, undefined, 0.1 );

    this.add( lensFlare );
  }
}
