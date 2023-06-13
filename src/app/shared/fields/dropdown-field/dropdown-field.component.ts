/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';

@Component( {
	selector: 'app-dropdown-field',
	templateUrl: './dropdown-field.component.html',
	styleUrls: [ './dropdown-field.component.css' ]
} )
export class DropdownFieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: any;

	@Input() label: string;

	@Input() options: any[] = [];

	constructor () {

		super();

	}

	ngOnInit () {


	}

	onChanged ( $event ) {

		this.changed.emit( $event.target.value );

	}

}
