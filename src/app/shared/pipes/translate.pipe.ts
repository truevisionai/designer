/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe( {
	name: 'translate'
} )
export class TranslatePipe implements PipeTransform {

	transform ( value: any, args?: any ): any {
		return value;
	}

}
