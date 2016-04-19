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
    const enginePoints = [
      [ 0.03, 0 ],
      [ 0.03, 0.05 ],
      [ 0.025, 0.16 ],
      [ 0.015, 0.18 ],
      [ 0, 0.18 ]
    ].map( createLathePoint );

    const engineGeometry = new THREE.LatheGeometry( enginePoints, 16 )
      .rotateX( Math.PI / 2 )
      .translate( 0, 0, 0.02 );

    const leftEngineGeometry = engineGeometry.clone().translate( -0.1, 0, 0 );
    const rightEngineGeometry = engineGeometry.clone().translate( 0.1, 0, 0 );

    const wing = [ 0.35, 0.012, 0.1 ];
    const leftWingPosition = [ -wing[0] / 2, 0, 0.12 ];
    const rightWingPosition = [ ...leftWingPosition ];
    rightWingPosition[0] = -rightWingPosition[0];
    const wingDihedralAngle = Math.PI / 24;

    const geometry = new THREE.Geometry();

    geometry.merge( leftEngineGeometry );
    geometry.merge( rightEngineGeometry );
    geometry.merge( new THREE.BoxGeometry( ...wing ).translate( ...leftWingPosition ).rotateZ( wingDihedralAngle ) );
    geometry.merge( new THREE.BoxGeometry( ...wing ).translate( ...rightWingPosition ).rotateZ( -wingDihedralAngle ) );
    geometry.merge( new THREE.BoxGeometry( 0.12, 0.07, 0.2 ).translate( 0, 0, 0.1 ) );

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
    super( geometries.basic, material.clone() );
    collisionMixin( this );

    this.type = 'ship';
    this.shape = CollisionShapes.SPHERE;
    this.collisionFilterGroup = CollisionGroups.SHIP;

    this.shield = new Shield();
    this.shield.visible = false;
    this.add( this.shield );

    this.engines = new THREE.Group();
    this.add( this.engines );

    engines.basic.map( position => {
      const engine = new Engine( this );
      engine.position.fromArray( position );
      this.engines.add( engine );
    });
  }
}
