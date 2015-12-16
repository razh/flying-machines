import THREE from 'three.js';

const materials = {
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
    gradient.addColorStop( 0.3, '#fff' );
    gradient.addColorStop( 0.5, '#ffd' );
    // rgba(#f83, 0.2).
    gradient.addColorStop( 0.7, 'rgba(255, 136, 51, 0.2)' );
    gradient.addColorStop( 1, 'transparent' );

    ctx.fillStyle = gradient;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    const texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;

    return new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      map: texture
    });
  })()
};

export default class Sun extends THREE.Group {
  constructor( ...args ) {
    super( ...args );

    const core = new THREE.Sprite( materials.core );
    core.scale.set( 4, 4, 4 );
    this.add( core );
  }
}
