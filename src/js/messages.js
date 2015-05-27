import protobuf from 'protocol-buffers';

const fs = require( 'fs' );
const path = require( 'path' );

const messages = protobuf(
  fs.readFileSync( path.join( __dirname, '/../proto/index.proto' ), 'utf8' )
);

export default messages;
