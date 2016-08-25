import {
  CylinderGeometry,
  FlatShading,
  Geometry,
  Group,
  Mesh,
  MeshPhongMaterial,
} from 'three';

const config = {
  base: {
    radiusTop: 0.05,
    radiusBottom: 0.07,
    height: 0.12,
  },
  gunhouse: {
    radiusTop: 0.04,
    radiusBottom: 0.05,
    height: 0.04,
  },
  barrels: {
    radiusTop: 0.008,
    radiusBottom: 0.01,
    height: 0.08,
    offset: 0.012,
  },
};

function computeNormals( geometry ) {
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  return geometry;
}

// Converts CylinderGeometry to axis-aligned trapezoidal prisms.
function turretTransform( geometry, height ) {
  return geometry
    .rotateY( Math.PI / 4 )
    .translate( 0, height / 2, 0 );
}

const baseGeometry = computeNormals(
  turretTransform( new CylinderGeometry(
    config.base.radiusTop, config.base.radiusBottom, config.base.height,
    4, 1, false
  ), config.base.height )
);

const barrelsGeometry = (() => {
  const geometry = new Geometry();

  const leftBarrelGeometry = new CylinderGeometry(
    config.barrels.radiusTop, config.barrels.radiusBottom, config.barrels.height,
    4, 1, false
  );

  const rightBarrelGeometry = leftBarrelGeometry.clone();

  geometry.merge(
    turretTransform( leftBarrelGeometry, config.barrels.height )
      .translate( -config.barrels.offset, 0, 0 )
  );

  geometry.merge(
    turretTransform( rightBarrelGeometry, config.barrels.height )
      .translate( config.barrels.offset, 0, 0 )
  );

  return computeNormals( geometry );
})();

const gunhouseGeometry = computeNormals(
  turretTransform( new CylinderGeometry(
    config.gunhouse.radiusTop, config.gunhouse.radiusBottom, config.gunhouse.height,
    4, 1, false
  ), config.gunhouse.height )
);

const material = new MeshPhongMaterial({
  shading: FlatShading,
});

export default class Turret extends Group {
  constructor() {
    super();

    this.base = new Mesh( baseGeometry, material.clone() );
    this.gunhouse = new Mesh( gunhouseGeometry, material.clone() );
    this.barrels = new Mesh( barrelsGeometry, material.clone() );

    this.gunhouse.position.y = config.base.height;
    this.barrels.position.y = config.gunhouse.height / 2;

    this.add( this.base );
    this.base.add( this.gunhouse );
    this.gunhouse.add( this.barrels );

    this.time = 0;
    this.type = 'turret';
  }

  update( dt ) {
    this.time += dt;
    this.time %= 2 * Math.PI;

    this.gunhouse.rotation.y = Math.PI * Math.sin( this.time / 2 );
    this.barrels.rotation.x = Math.PI / 4 * ( Math.cos( this.time ) + 1 );
  }
}
