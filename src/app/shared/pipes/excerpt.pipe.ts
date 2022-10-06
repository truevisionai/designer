/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe( { name: 'excerpt' } )
export class ExcerptPipe implements PipeTransform {
    transform ( text: string, limit: number = 5 ) {
        if ( text.length <= limit ) {
            return text;
        }
        return text.substring( 0, limit ) + '...';
    }
}
