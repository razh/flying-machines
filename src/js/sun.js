import {
  AdditiveBlending,
  Color,
  Group,
  LensFlare,
  Texture,
} from 'three';

import color from 'color';
import { defineLazyGetters } from './lazy';

export const textures = defineLazyGetters( {}, {
  core() {
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
    gradient.addColorStop( 0.3, '#ddf' );
    gradient.addColorStop( 0.35, color( '#ddf' ).alpha( 0.8 ).hslString() );
    gradient.addColorStop( 0.7, color( '#77f' ).alpha( 0.2 ).hslString() );
    gradient.addColorStop( 1, 'transparent' );

    ctx.fillStyle = gradient;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    const texture = new Texture( canvas );
    texture.needsUpdate = true;
    return texture;
  },

  lensFlare() {
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

    const texture = new Texture( canvas );
    texture.needsUpdate = true;
    return texture;
  },

  anamorphicFlare() {
    const diameter = 256;
    const radius = diameter / 2;
    const scaleY = 0.02;

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    canvas.width = diameter;
    canvas.height = diameter;

    const gradient = ctx.createRadialGradient(
      radius, radius, 0,
      radius, radius, radius
    );

    gradient.addColorStop( 0, '#fff' );
    gradient.addColorStop( 1, 'transparent' );

    /*
        +--------------+
        |              |
        +--------------+                      -+-
        |   ellipse    |                       |
        |   bounding   | - canvas.height / 2   | canvas.height * scaleY
        |     box      |                       |
        +--------------+                      -+-
        |              |
        +--------------+
     */
    const y = canvas.height * ( 1 - scaleY ) / 2;

    ctx.translate( 0, y );
    ctx.scale( 1, scaleY );
    ctx.fillStyle = gradient;
    ctx.fillRect( 0, 0, canvas.width, canvas.height / scaleY );

    const texture = new Texture( canvas );
    texture.needsUpdate = true;
    return texture;
  },
});

export default class Sun extends Group {
  constructor( ...args ) {
    super( ...args );

    const lensFlare = new LensFlare();
    lensFlare.add( textures.core, 128, 0, AdditiveBlending );

    const color = new Color( '#77f' );
    lensFlare.add( textures.anamorphicFlare, 1024, 0, AdditiveBlending, color, 0.5 );
    lensFlare.add( textures.lensFlare, 64, 0.5, AdditiveBlending, color, 0.1 );
    lensFlare.add( textures.lensFlare, 96, 0.7, AdditiveBlending, color, 0.1 );
    lensFlare.add( textures.lensFlare, 128, 0.9, AdditiveBlending, color, 0.1 );
    lensFlare.add( textures.lensFlare, 96, 1, AdditiveBlending, color, 0.1 );

    lensFlare.customUpdateCallback = () => {
      LensFlare.prototype.updateLensFlares.call( lensFlare );
      lensFlare.lensFlares[1].rotation = 0;
    };

    this.add( lensFlare );
  }
}
