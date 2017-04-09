import * as THREE from 'three';
import Entity from './entity';
import { SHIP } from './types';
import Shield from './shield';
import Engine from './engine';
import { defineLazyGetters } from './lazy';
import { collisionMixin, CollisionShapes, CollisionGroups } from './collision';
import { translate as translateBox } from './box-geometry';

const createLathePoint = ([ x, y ]) => new THREE.Vector2( x, y );

const ALPHA_ENGINE_Y = -0.16;

const geometries = defineLazyGetters( {}, {
  basic() {
    const geometry = new THREE.CylinderBufferGeometry( 0, 1.6, 8, 48 );

    geometry.rotateX( -Math.PI / 2 );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  sphere() {
    return new THREE.IcosahedronBufferGeometry( 3.2, 1 );
  },

  diamonds() {
    const points = [
      [ 0, 0 ],
      [ 0.8, 1.6 ],
      [ 0, 6.4 ],
    ].map( createLathePoint );

    const geometry = new THREE.LatheGeometry( points, 3 )
      .rotateX( Math.PI / 2 );

    const boosterPoints = [
      [ 0, 0 ],
      [ 0.4, 0.64 ],
      [ 0.4, 1.28 ],
      [ 0, 3.2 ],
    ].map( createLathePoint );

    const leftBoosterGeometry = new THREE.LatheGeometry( boosterPoints, 4 );
    const rightBoosterGeometry = new THREE.LatheGeometry( boosterPoints, 4 );

    leftBoosterGeometry
      .rotateX( Math.PI / 2 )
      .translate( -1.6, 0, 0 );

    rightBoosterGeometry
      .rotateX( Math.PI / 2 )
      .translate( 1.6, 0, 0 );

    geometry.merge( leftBoosterGeometry );
    geometry.merge( rightBoosterGeometry );

    geometry
      .rotateX( Math.PI )
      .translate( 0, 0, 2.4 );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  alpha() {
    const geometry = new THREE.Geometry();

    // Engine.
    const enginePoints = [
      [ 0, 0 ],
      [ 0.32, 0.16 ],
      [ 0.4, 0.32 ],
      [ 0.4, 2.56 ],
      [ 0.24, 2.88 ],
      [ 0, 2.88 ],
    ].map( createLathePoint );

    const engineGeometry = new THREE.LatheGeometry( enginePoints, 8 )
      .rotateX( Math.PI / 2 )
      .translate( 0, ALPHA_ENGINE_Y, 0.32 );

    const leftEngineGeometry = engineGeometry.clone().translate( -1.6, 0, 0 );
    const rightEngineGeometry = engineGeometry.clone().translate( 1.6, 0, 0 );

    geometry.merge( leftEngineGeometry );
    geometry.merge( rightEngineGeometry );

    // Wings.
    const wing = [ 5.6, 0.32, 1.92 ];
    const rightWingPosition = [ wing[0] / 2, 0, 1.92 ];
    const leftWingPosition = [ ...rightWingPosition ];
    leftWingPosition[0] = -leftWingPosition[0];
    const wingDihedralAngle = Math.PI / 24;

    const wingGeometry = new THREE.BoxGeometry( ...wing );
    translateBox( wingGeometry, {
      top_right: { y: -0.288 },
      front_right: { z: -1.12 },
    });

    const rightWingGeometry = new THREE.Geometry()
      .copy( wingGeometry )
      .translate( ...rightWingPosition )
      .rotateZ( -wingDihedralAngle );

    geometry.merge( rightWingGeometry );

    const leftWingGeometry = new THREE.Geometry()
      .copy( wingGeometry )
      .rotateZ( Math.PI )
      .translate( ...leftWingPosition )
      .rotateZ( wingDihedralAngle );

    geometry.merge( leftWingGeometry );

    // Front fuselage.
    const frontFuselage = [ 1.92, 1.12, 4.8 ];
    const frontFuselageGeometry = new THREE.BoxGeometry( ...frontFuselage );

    const fx = 0.48;
    const fy = 0.48;
    translateBox( frontFuselageGeometry, {
      back_right: { x: -fx },
      back_left: { x: fx },
      top_back: { y: -fy },
      bottom_back: { y: fy },
    });

    geometry.merge( frontFuselageGeometry );

    // Rear fuselage.
    const rearFuselage = [ ...frontFuselage ];
    rearFuselage[2] = 0.8;

    const rearFuselageGeometry = new THREE.BoxGeometry( ...rearFuselage )
      .translate( 0, 0, ( frontFuselage[2] + rearFuselage[2] ) / 2 );

    const rx = 0.32;
    const ry = 0.16;
    translateBox( rearFuselageGeometry, {
      front_right: { x: -rx },
      front_left: { x: rx },
      top_front: { y: -ry },
      bottom_front: { y: ry },
    });

    geometry.merge( rearFuselageGeometry );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },
});

// Engine attachment points.
const engines = {
  basic: [
    [ 0, 0, 4.8 ],
  ],

  sphere: [
    [ 0, 0, 4.8 ],
  ],

  diamonds: [
    [ 0, 0, 4.8 ],
  ],

  alpha: [
    [ -1.6, ALPHA_ENGINE_Y, 4.8 ],
    [ 1.6, ALPHA_ENGINE_Y, 4.8 ],
  ],
};

const material = new THREE.MeshStandardMaterial({
  shading: THREE.FlatShading,
});

export default class Ship extends Entity {
  constructor() {
    super( geometries.alpha, material.clone() );
    collisionMixin( this );

    this.type = SHIP;
    this.shape = CollisionShapes.SPHERE;
    this.collisionFilterGroup = CollisionGroups.SHIP;

    this.shield = new Shield();
    this.shield.visible = false;
    this.add( this.shield );

    this.engines = new THREE.Group();
    this.add( this.engines );

    engines.alpha.map( position => {
      const engine = new Engine( this );
      engine.position.fromArray( position );
      this.engines.add( engine );
    });
  }
}
