/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';

@Component( {
	selector: 'app-enum-field',
	templateUrl: './enum-field.component.html',
	styleUrls: [ './enum-field.component.css' ]
} )
export class EnumFieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: any;

	@Input() label: string;

	@Input() enum: any;

	public options = [];

	constructor () {

		super();

	}

	ngOnInit () {

		// KEY, VALUE
		// UNKNWON = unkonwn
		// RURAL = rurual
		//

		// labels are the actual enums
		// UNKNOWN, RURAL ETC
		const labels = Object.keys( this.enum );

		Object.values( this.enum ).forEach( ( value, index ) => {

			// label is the string to be shown to user
			// this will only be a string
			const label = labels[ index ];

			this.options.push( {
				value: value,
				label: label,
			} );

		} );

	}

	onChanged ( $event ) {

		this.changed.emit( $event.target.value );

	}
}
