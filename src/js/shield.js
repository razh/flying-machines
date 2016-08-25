import {
  IcosahedronGeometry,
  Mesh,
  MeshPhongMaterial,
} from 'three';

const geometry = new IcosahedronGeometry( 0.2, 1 );
const material = new MeshPhongMaterial({
  opacity: 0,
  transparent: true,
  wireframe: true,
});

export default class Shield extends Mesh {
  constructor() {
    super( geometry, material.clone() );
  }
}
