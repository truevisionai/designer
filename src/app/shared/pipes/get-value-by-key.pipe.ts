/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe( {
	name: 'getValueByKey',
	pure: false
} )
export class GetValueByKeyPipe implements PipeTransform {
	transform ( value: any[], id: number, property: string ): any {
		const filteredObj = value.find( item => {
			if ( item.id !== undefined ) {
				return item.id === id;
			}

			return false;
		} );

		if ( filteredObj ) {
			return filteredObj[ property ];
		}
	}
}

@Pipe( { name: 'keys' } )
export class KeysPipe implements PipeTransform {
	transform ( value, args: string[] ): any {
		let keys = [];
		for ( var enumMember in value ) {
			if ( !isNaN( parseInt( enumMember, 10 ) ) ) {
				keys.push( { key: enumMember, value: value[ enumMember ] } );
				// Uncomment if you want log
			}
		}
		return keys;
	}
}
