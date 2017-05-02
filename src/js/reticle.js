import * as THREE from 'three';
import config from './config';
import { defineLazyGetters } from './lazy';

export const reticles = defineLazyGetters( {}, {
  diamond() {
    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

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
      blending: THREE.AdditiveBlending,
      depthTest: false,
      map: texture,
      rotation: Math.PI / 4,
    });
  },

  arc() {
    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    const size = 128;
    const halfSize = size / 2;
    const lineWidth = 8;
    const radius = ( size - lineWidth ) / 2;

    canvas.width = size;
    canvas.height = size;

    const arcCount = 3;
    const padAngle = Math.PI / 3;
    const arcAngle = 2 * Math.PI / arcCount - padAngle;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#fff';

    for ( let i = 0; i < arcCount; i++ ) {
      const startAngle = i * ( arcAngle + padAngle );

      ctx.beginPath();
      ctx.arc( halfSize, halfSize, radius, startAngle, startAngle + arcAngle );
      ctx.stroke();
    }

    const texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;

    return new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      depthTest: false,
      map: texture,
    });
  },
});

const vector = new THREE.Vector3();

export default class Reticle extends THREE.Sprite {
  constructor( target ) {
    super( reticles.diamond );

    this.target = target;

    this.lookahead = 1;
    this.stiffness = 12;
    this.scale.setLength( 8 );
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
    this.scale.setLength( 8 );
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

// http://wiki.unity3d.com/index.php/Calculating_Lead_For_Projectiles
const predict = (() => {
  'use strict';

  const dx = new THREE.Vector3();
  const dv = new THREE.Vector3();

  return ( source, target, muzzleVelocity = 0 ) => {
    dx.subVectors( target.position, source.position );
    dv.subVectors( target.velocity, source.velocity );

    const a = dv.lengthSq() - (muzzleVelocity * muzzleVelocity );
    const b = 2 * dv.dot( dx );
    const c = dx.lengthSq();

    if ( a === 0 ) {
      if ( b === 0 ) {
        return;
      }

      return -c / b;
    }

    const d = ( b * b ) - ( 4 * a * c );

    if ( d < 0 ) {
      return;
    }

    const p = -b / ( 2 * a );

    if ( d === 0 ) {
      return p;
    }

    const q = Math.sqrt( d ) / ( 2 * a );

    const t0 = p - q;
    const t1 = p + q;

    if ( t0 >= 0 && t1 >= 0 ) {
      return Math.min( t0, t1 );
    } else if ( t0 >= 0 ) {
      return t0;
    } else if ( t1 >= 0 ) {
      return t1;
    }

    return;
  };
})();

export class TargetingComputer extends THREE.Group {
  constructor( source, target ) {
    super();

    this.source = source;
    this.target = target;

    this.speed = config.bullet.speed;
    this.stiffness = 12;

    this.reticle = new THREE.Sprite( reticles.diamond );
    this.prediction = new THREE.Sprite( reticles.diamond );

    const scale = 8;
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

    const time = predict( source, target, this.speed );
    if ( !time ) {
      return;
    }

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
