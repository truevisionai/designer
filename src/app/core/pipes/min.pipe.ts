/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe( {
    name: 'min'
} )
export class MinPipe implements PipeTransform {

    // transform(value: any, args?: any): any {
    //   return null;
    // }

    transform ( value: number, min: number ): number {

        var rtuenr = Math.max( value, min );


        return rtuenr;

    }
}
