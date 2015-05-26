import protobuf from 'protocol-buffers';

const fs = require( 'fs' );
const path = require( 'path' );

export const messages = protobuf(
  fs.readFileSync( path.join( __dirname, '/../proto/index.proto' ), 'utf8' )
);

