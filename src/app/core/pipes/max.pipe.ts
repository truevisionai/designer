/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe( {
	name: 'max'
} )
export class MaxPipe implements PipeTransform {

	transform ( value: any, args?: any ): any {
		return null;
	}

}
