/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export function getIndexBy ( array: Array<{}>, { name, value } ): number {
    for ( let i = 0; i < array.length; i++ ) {
        if ( array[ i ][ name ] === value ) {
            return i;
        }
    }
    return -1;
}
