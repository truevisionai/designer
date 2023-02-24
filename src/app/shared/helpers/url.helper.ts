/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export function getQueryParam ( prop ) {
    var params = {};
    var search = decodeURIComponent( window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ) );
    var definitions = search.split( '&' );
    definitions.forEach( function ( val, key ) {
        var parts = val.split( '=', 2 );
        params[ parts[ 0 ] ] = parts[ 1 ];
    } );
    return ( prop && prop in params ) ? params[ prop ] : params;
}
