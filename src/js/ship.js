import THREE from 'three';
import Entity from './entity';
import Shield from './shield';
import Engine from './engine';
import { defineLazyGetters } from './lazy';
import { collisionMixin, CollisionShapes, CollisionGroups } from './collision';

const createLathePoint = ([ x, y ]) => new THREE.Vector2( x, y );

const geometries = defineLazyGetters( {}, {
  basic() {
    const geometry = new THREE.CylinderGeometry( 0, 0.1, 0.5, 3 );

    geometry.rotateX( -Math.PI / 2 );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  sphere() {
    return new THREE.IcosahedronGeometry( 0.2, 1 );
  },

  diamonds() {
    const points = [
      [ 0, 0 ],
      [ 0.05, 0.1 ],
      [ 0, 0.4 ]
    ].map( createLathePoint );

    const geometry = new THREE.LatheGeometry( points, 3 )
      .rotateX( Math.PI / 2 );

    const boosterPoints = [
      [ 0, 0 ],
      [ 0.025, 0.04 ],
      [ 0.025, 0.08 ],
      [ 0, 0.2 ]
    ].map( createLathePoint );

    const leftBoosterGeometry = new THREE.LatheGeometry( boosterPoints, 4 );
    const rightBoosterGeometry = new THREE.LatheGeometry( boosterPoints, 4 );

    leftBoosterGeometry
      .rotateX( Math.PI / 2 )
      .translate( -0.1, 0, 0 );

    rightBoosterGeometry
      .rotateX( Math.PI / 2 )
      .translate( 0.1, 0, 0 );

    geometry.merge( leftBoosterGeometry );
    geometry.merge( rightBoosterGeometry );

    geometry
      .rotateX( Math.PI )
      .translate( 0, 0, 0.15 );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  alpha() {
    const geometry = new THREE.Geometry();

    // Engine.
    const enginePoints = [
      [ 0, 0 ],
      [ 0.02, 0.01 ],
      [ 0.025, 0.02 ],
      [ 0.025, 0.16 ],
      [ 0.015, 0.18 ],
      [ 0, 0.18 ]
    ].map( createLathePoint );

    const engineGeometry = new THREE.LatheGeometry( enginePoints, 16 )
      .rotateX( Math.PI / 2 )
      .translate( 0, 0, 0.02 );

    const leftEngineGeometry = engineGeometry.clone().translate( -0.1, 0, 0 );
    const rightEngineGeometry = engineGeometry.clone().translate( 0.1, 0, 0 );

    geometry.merge( leftEngineGeometry );
    geometry.merge( rightEngineGeometry );

    // Wings.
    const wing = [ 0.35, 0.02, 0.12 ];
    const rightWingPosition = [ wing[0] / 2, 0, 0.12 ];
    const leftWingPosition = [ ...rightWingPosition ];
    leftWingPosition[0] = -leftWingPosition[0];
    const wingDihedralAngle = Math.PI / 24;

    const wingGeometry = new THREE.BoxGeometry( ...wing );
    wingGeometry.vertices[0].y = ( wingGeometry.vertices[1].y -= 0.018 );
    wingGeometry.vertices[1].z = ( wingGeometry.vertices[3].z += 0.07 );

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
    const frontFuselage = [ 0.12, 0.07, 0.3 ];
    const frontFuselageGeometry = new THREE.BoxGeometry( ...frontFuselage );

    const fx = 0.03;
    frontFuselageGeometry.vertices[1].x = ( frontFuselageGeometry.vertices[3].x -= fx );
    frontFuselageGeometry.vertices[4].x = ( frontFuselageGeometry.vertices[6].x += fx );

    const fy = 0.03;
    frontFuselageGeometry.vertices[1].y = ( frontFuselageGeometry.vertices[4].y -= fy );
    frontFuselageGeometry.vertices[3].y = ( frontFuselageGeometry.vertices[6].y += fy );

    geometry.merge( frontFuselageGeometry );

    // Rear fuselage.
    const rearFuselage = [ ...frontFuselage ];
    rearFuselage[2] = 0.05;

    const rearFuselageGeometry = new THREE.BoxGeometry( ...rearFuselage )
      .translate( 0, 0, ( frontFuselage[2] + rearFuselage[2] ) / 2 );

    const rx = 0.02;
    rearFuselageGeometry.vertices[0].x = ( rearFuselageGeometry.vertices[2].x -= rx );
    rearFuselageGeometry.vertices[5].x = ( rearFuselageGeometry.vertices[7].x += rx );

    const ry = 0.01;
    rearFuselageGeometry.vertices[0].y = ( rearFuselageGeometry.vertices[5].y -= ry );
    rearFuselageGeometry.vertices[2].y = ( rearFuselageGeometry.vertices[7].y += ry );

    geometry.merge( rearFuselageGeometry );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  }
});

// Engine attachment points.
const engines = {
  basic: [
    [ 0, 0, 0.3 ]
  ],

  sphere: [
    [ 0, 0, 0.3 ]
  ],

  diamonds: [
    [ 0, 0, 0.3 ]
  ],

  alpha: [
    [ -0.1, 0, 0.3 ],
    [ 0.1, 0, 0.3 ]
  ]
};

const material = new THREE.MeshStandardMaterial({
  shading: THREE.FlatShading
});

export default class Ship extends Entity {
  constructor() {
    super( geometries.alpha, material.clone() );
    collisionMixin( this );

    this.type = 'ship';
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
