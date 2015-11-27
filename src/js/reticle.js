import THREE from 'three.js';
import config from './config';

const canvas = document.createElement( 'canvas' );
const ctx = canvas.getContext( '2d' );

export const reticles = {
  diamond: (() => {
    const size = 128;

    // Segment length.
    const length = 32;

    const lineWidth = 8;
    const halfLineWidth = lineWidth / 2;

    canvas.width = size;
    canvas.height = size;

    /*
      Counter-clockwise from top-left:

        +--   --+
        |       |

        |       |
        +--   --+
     */

    ctx.beginPath();

    // Top left.
    ctx.moveTo( halfLineWidth + length, halfLineWidth );
    ctx.lineTo( halfLineWidth,          halfLineWidth );
    ctx.lineTo( halfLineWidth,          halfLineWidth + length );

    // Bottom left.
    ctx.moveTo( halfLineWidth,          size - halfLineWidth - length );
    ctx.lineTo( halfLineWidth,          size - halfLineWidth );
    ctx.lineTo( halfLineWidth + length, size - halfLineWidth );

    // Bottom right.
    ctx.moveTo( size - halfLineWidth - length, size - halfLineWidth );
    ctx.lineTo( size - halfLineWidth,          size - halfLineWidth );
    ctx.lineTo( size - halfLineWidth,          size - halfLineWidth - length );

    // Top right.
    ctx.moveTo( size - halfLineWidth,          halfLineWidth + length );
    ctx.lineTo( size - halfLineWidth,          halfLineWidth );
    ctx.lineTo( size - halfLineWidth - length, halfLineWidth );

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    const texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;

    return new THREE.SpriteMaterial({
      depthTest: false,
      map: texture,
      rotation: Math.PI / 4,
      transparent: true
    });
  })()
};

const vector = new THREE.Vector3();

export default class Reticle extends THREE.Sprite {
  constructor( target ) {
    super( reticles.diamond );

    this.target = target;

    this.lookahead = 1;
    this.stiffness = 12;
    this.scale.setLength( 1 / 2 );
  }

  update( dt ) {
    if ( !this.target ) {
      return;
    }

    vector.set( 0, 0, -config.bullet.speed * this.lookahead )
      .applyQuaternion( this.target.quaternion )
      .add( this.target.position )
      .addScaledVector( this.target.velocity, this.lookahead );

    this.position.lerp( vector, this.stiffness * dt );
  }
}

export class Prediction extends THREE.Sprite {
  constructor( target ) {
    super( reticles.diamond );

    this.target = target;

    this.lookahead = 1;
    this.stiffness = 12;
    this.scale.setLength( 1 / 2 );
  }

  update( dt ) {
    if ( !this.target ) {
      return;
    }

    vector.copy( this.target.position )
      .addScaledVector( this.target.velocity, this.lookahead );

    this.position.lerp( vector, this.stiffness * dt );
  }
}

export class TargetingComputer extends THREE.Group {
  constructor( source, target ) {
    super();

    this.source = source;
    this.target = target;

    this.speed = config.bullet.speed;
    this.stiffness = 12;

    this.reticle = new THREE.Sprite( reticles.diamond );
    this.prediction = new THREE.Sprite( reticles.diamond );

    const scale = 1 / 2;
    this.reticle.scale.setLength( scale );
    this.prediction.scale.setLength( scale );

    this.add( this.reticle );
    this.add( this.prediction );
  }

  update( dt ) {
    const { source, target } = this;
    if ( !target || !this.speed ) {
      return;
    }

    /*
      source  o
              |\
              | \
      delta   |  \
              |   \
              |    \
      target  o-----o prediction
               v * t
     */

    const delta = vector
      .subVectors( target.position, source.position );

    const distance = delta.length();
    const speed = source.velocity.dot( delta.normalize() ) + this.speed;
    const time = distance / speed;

    // Update reticle.
    vector.set( 0, 0, -this.speed * time )
      .applyQuaternion( source.quaternion )
      .add( source.position )
      .addScaledVector( source.velocity, time );

    this.reticle.position.lerp( vector, this.stiffness * dt );

    // Update prediction.
    vector.copy( target.position )
      .addScaledVector( target.velocity, time );

    this.prediction.position.lerp( vector, this.stiffness * dt );
  }
}
