/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';

@Component( {
	selector: 'app-dropdown-field',
	templateUrl: './dropdown-field.component.html',
	styleUrls: [ './dropdown-field.component.css' ],
	providers: [ TitleCasePipe ]
} )
export class DropdownFieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: any;

	@Input() label: string;

	@Input() options: any[] = [];

	constructor ( private titleCase: TitleCasePipe ) {

		super();

	}

	ngOnInit () {


	}

	onChanged ( $event ) {

		this.changed.emit( $event.target.value );

	}

	showOption ( option: any ) {

		if ( typeof ( option ) == 'string' ) {

			return this.titleCase.transform( option );

		} else {

			return option;

		}

	}
}
