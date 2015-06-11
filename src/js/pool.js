export default function createPool( scene, Constructor ) {
  const pool = [];
  let count = 0;
  let length = 0;

  function get() {
    if ( count === length ) {
      const object = new Constructor();
      scene.add( object );
      pool.push( object );
      length++;
      count++;
      return object;
    }

    return pool[ count++ ];
  }

  function reset() {
    count = 0;
  }

  return { get, reset };
}
