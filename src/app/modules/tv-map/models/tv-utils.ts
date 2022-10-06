/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';

export class TvUtils {

    static checkInterval ( items: Map<number, ThirdOrderPolynom>, s: number, sort: boolean = false ): ThirdOrderPolynom {

        let array = [];

        if ( sort ) {

            const inDescOrder = ( a, b ) => a[ 0 ] > b[ 0 ] ? -1 : 1;

            array = [ ...items.entries() ].sort( inDescOrder );

        } else {

            array = Array.from( items.entries() );

        }

        const checkInterval = ( a, b ) => a[ 0 ] > s ? -1 : 1;

        return array.sort( checkInterval ).pop();
    }

    static checkIntervalArray ( items: { s: number }[], s: number ): any {

        let result = null;

        for ( let i = 0; i < items.length; i++ ) {

            const item = items[ i ];

            if ( s >= item.s ) result = item;

        }

        return result;

        // less efficient map copy method
        // const array = Array.from( items.entries() );
        //
        // // filter items that are equal and greater than the given s
        // const checkInterval = ( a ) => a[ 0 ] >= s ? -1 : 1;
        //
        // try {
        //
        //     // get the last item from the list
        //     return array.filter( checkInterval ).pop()[ 1 ];
        //
        // } catch ( e ) {
        //
        //     console.error( e );
        //     console.error( items, s );
        //
        // }

    }

    static getRandomMapItem ( map: Map<number, any> ): any {

        let items = Array.from( map );

        return items[ Math.floor( Math.random() * items.length ) ][ 1 ];

    }

    static getRandomArrayItem ( items: any[] ): any {

        return items[ Math.floor( Math.random() * items.length ) ];

    }
}
