import THREE from 'three';

const maps = {
  minimal( scene ) {
    const geometry = new THREE.IcosahedronGeometry( 1, 2 );
    const material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading
    });

    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0, 0, -8 );
    scene.add( mesh );

    const light = new THREE.PointLight();
    light.position.set( 8, 8, 8 );
    scene.add( light );

    scene.add( new THREE.HemisphereLight( '#f43', '#33a', 0.5 ) );
  }
};

export default function createMap( scene, name ) {
  maps[ name ]( scene );
}
