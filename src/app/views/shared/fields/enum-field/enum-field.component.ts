/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from 'app/views/shared/fields/abstract-field.component';

@Component( {
	selector: 'app-enum-field',
	templateUrl: './enum-field.component.html',
	styleUrls: [ './enum-field.component.css' ]
} )
export class EnumFieldComponent extends AbstractFieldComponent<any> implements OnInit {

	@Input() value: any;

	@Input() label: string;

	@Input() enum: any;

	public options = [];

	constructor () {

		super();

	}

	ngOnInit (): void {

		const labels = Object.keys( this.enum );
		const values = Object.values( this.enum );

		const unsortedOptions = values.map( ( value, index ) => {
			return { value: value, label: labels[ index ] };
		} );

		// Sort the options alphabetically based on the label
		this.options = unsortedOptions.sort( ( a, b ) => {
			return a.label.localeCompare( b.label );
		} );

	}

	onChanged ( $event: any ): void {

		this.changed.emit( $event.target.value );

	}
}
