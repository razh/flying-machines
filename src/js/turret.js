import THREE from 'three';

const config = {
  base: {
    radiusTop: 0.05,
    radiusBottom: 0.08,
    height: 0.15
  },
  gun: {
    radiusTop: 0.02,
    radiusBottom: 0.03,
    height: 0.08
  }
};

const rotationMatrix = new THREE.Matrix4().makeRotationY( Math.PI / 4 );
const translationMatrix = new THREE.Matrix4();

const baseGeometry = new THREE.CylinderGeometry(
  config.base.radiusTop, config.base.radiusBottom, config.base.height,
  4, 1, false
);

translationMatrix.makeTranslation( 0, config.base.height / 2, 0 );

baseGeometry.applyMatrix( rotationMatrix );
baseGeometry.applyMatrix( translationMatrix );

baseGeometry.computeFaceNormals();
baseGeometry.computeVertexNormals();

const gunGeometry = new THREE.CylinderGeometry(
  config.gun.radiusTop, config.gun.radiusBottom, config.gun.height,
  4, 1, false
);

translationMatrix.makeTranslation( 0, config.gun.height / 2, 0 );

gunGeometry.applyMatrix( rotationMatrix );
gunGeometry.applyMatrix( translationMatrix );

gunGeometry.computeFaceNormals();
gunGeometry.computeVertexNormals();

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

class TurretBase extends THREE.Mesh {
  constructor() {
    super( baseGeometry, material.clone() );
  }
}

class TurretGun extends THREE.Mesh {
  constructor() {
    super( gunGeometry, material.clone() );
  }
}

const clock = new THREE.Clock();

export default class Turret extends THREE.Group {
  constructor() {
    super();
    this.base = new TurretBase();
    this.gun = new TurretGun();

    this.add( this.base );
    this.base.add( this.gun );
    this.gun.position.y = config.base.height;
  }

  update() {
    this.gun.rotation.x = Math.cos( clock.getElapsedTime() );
    this.base.rotation.y = Math.sin( clock.getElapsedTime() );
  }
}
