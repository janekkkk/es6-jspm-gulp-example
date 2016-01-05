'use strict';
// Remove path and extension leaving only the file name.
exports.getFilenameFromPath = function( file )
{
  var index = file.lastIndexOf( '/' );
  if( index != -1 )
  {
    file = file.substring( index + 1 ).split( '.js' ).join( '' );
  }
  return file;
};
