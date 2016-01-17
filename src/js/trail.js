import THREE from 'three';
import times from 'lodash/times';

const lineMaterial = new THREE.LineBasicMaterial({
  blending: THREE.AdditiveBlending,
  color: '#f43',
  linewidth: 16,
  opacity: 0.25,
  side: THREE.DoubleSide,
  transparent: true
});

export class LineTrail extends THREE.Line {
  constructor( count = 64 ) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( 3 * count );
    const attribute = new THREE.BufferAttribute( vertices, 3 );
    geometry.addAttribute( 'position', attribute );

    super( geometry, lineMaterial );

    // Offset from target.
    this.offset = new THREE.Vector3();

    // Circular array of previous positions.
    this.positions = times( count, () => new THREE.Vector3() );

    // Current index of position array start.
    this.start = 0;

    this.frustumCulled = false;
  }

  track( target ) {
    this.positions[ this.start ].copy( this.offset )
      .applyQuaternion( target.quaternion )
      .add( target.position );

    this.start = ( this.start + 1 ) % this.positions.length;
  }

  generate() {
    const { position } = this.geometry.attributes;

    for ( let i = 0; i < this.positions.length; i++ ) {
      const index = ( i + this.start ) % this.positions.length;
      this.positions[ index ].toArray( position.array, 3 * i );
    }

    position.needsUpdate = true;
  }
}


const size = 256;

const canvas = document.createElement( 'canvas' );
const ctx = canvas.getContext( '2d' );

canvas.width = size;
canvas.height = size;

ctx.fillStyle = '#a32';
ctx.fillRect( 0, 0, size, size );

const texture = new THREE.Texture( canvas );
texture.needsUpdate = true;

const spriteMaterial = new THREE.SpriteMaterial({
  blending: THREE.AdditiveBlending,
  map: texture,
  rotation: Math.PI / 4,
  transparent: true,
  opacity: 0.9
});

export class TrailSprite extends THREE.Sprite {
  constructor() {
    super( spriteMaterial );
  }
}

export class SpriteTrail extends THREE.Group {
  constructor( options = {} ) {
    super();

    const {
      count = 64,
      time = 0.5,
      startScale = 0.02,
      endScale = 0,
      vertexDistance = 0.1
    } = options;

    this.time = time;
    this.startScale = startScale;
    this.endScale = endScale;
    this.vertexDistance = vertexDistance;

    let i = count;
    while ( i-- ) {
      const sprite = new TrailSprite();
      sprite.visible = false;
      this.add( sprite );
    }

    // Circular index.
    this.index = 0;

    this.previousPosition = null;
    this.distance = 0;
    this.offset = new THREE.Vector3();
  }

  next() {
    const sprite = this.children[ this.index ];
    sprite.visible = true;
    sprite.scale.set( 1, 1, 1 );
    this.index = ( this.index + 1 ) % this.children.length;
    return sprite;
  }

  track( target ) {
    if ( !this.previousPosition ) {
      this.previousPosition = target.position.clone();
      return;
    }

    this.distance += target.position.distanceTo( this.previousPosition );

    if ( this.distance >= this.vertexDistance ) {
      const sprite = this.next();

      sprite.scale.set( this.startScale, this.startScale, this.startScale );
      sprite.position.copy( this.offset )
        .applyQuaternion( target.quaternion )
        .add( target.position );

      this.distance -= this.vertexDistance;
    }

    this.previousPosition.copy( target.position );
  }

  update( dt ) {
    const ds = ( this.endScale - this.startScale ) / this.time * dt;

    this.children.forEach( sprite => {
      sprite.scale.addScalar( ds ).clampScalar( 0, Infinity )
    });
  }
}


export class ScreenSpaceTrail extends THREE.Mesh {
  constructor( count = 128 ) {
    const geometry = new THREE.PlaneBufferGeometry( 1, 1, count, 1 );

    const material = new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: '#f43',
      opacity: 0.25,
      transparent: true,
      wireframe: true
    });

    super( geometry, material );

    // Offset from target.
    this.offset = new THREE.Vector3();

    // Circular array of previous positions.
    this.positions = times( count, () => new THREE.Vector3() );

    // Current index of position array start.
    this.start = 0;
  }

  track( target ) {
    this.positions[ this.start ].copy( this.offset )
      .applyQuaternion( target.quaternion )
      .add( target.position );

    this.start = ( this.start + 1 ) % this.positions.length;
  }

  // Update to face camera in screenspace.
  willRender( camera ) {

  }
}
