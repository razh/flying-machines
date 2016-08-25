import { Math as _Math } from 'three';

/*
  Simple full-width graph.
 */
export default function createGraph( height = 64 ) {
  const canvas = document.createElement( 'canvas' );
  const ctx = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = height;

  const data = {};

  function draw() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );

    Object.keys( data ).forEach( key => {
      const d = data[ key ];

      // Avoid degenerate graphs.
      if ( d.range[0] === d.range[1] ) {
        return;
      }

      ctx.beginPath();

      d.values.forEach(( value, i ) => {
        const x = canvas.width - i;
        const y = _Math.mapLinear(
          value,
          d.range[0], d.range[1],
          canvas.height, 0
        );

        if ( !i ) {
          ctx.moveTo( x, y );
        } else {
          ctx.lineTo( x, y );
        }
      });

      ctx.strokeStyle = d.color;
      ctx.stroke();
    });
  }

  const resize = () => canvas.width = window.innerWidth;
  window.addEventListener( 'resize', resize );

  return {
    canvas,
    draw,

    add( key, color = '#fff' ) {
      data[ key ] = { key, color, values: [], range: [] };
    },

    update( key, value ) {
      const d = data[ key ];
      if ( !d ) {
        return;
      }

      d.values.unshift( value );
      while( d.values.length > canvas.width ) {
        d.values.pop();
      }

      d.range = [
        Math.min( ...d.values ),
        Math.max( ...d.values ),
      ];
    },

    remove( key ) {
      delete data[ key ];
    },

    destroy() {
      if ( canvas.parentNode ) {
        canvas.parentNode.removeChild( canvas );
      }

      window.removeEventListener( 'resize', resize );
    },
  };
}
