/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe( {
    name: 'search'
} )
export class SearchPipe implements PipeTransform {

    transform ( items: string[], query: string ): string[] {

        if ( !items ) return [];

        if ( !query ) return items;

        query = query.toLowerCase();

        return items.filter( it => {

            return it.toLowerCase().includes( query );

        } );
    }

}
