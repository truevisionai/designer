/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';

@Component( {
	selector: 'app-boolean-field',
	templateUrl: './boolean-field.component.html',
	styleUrls: [ './boolean-field.component.scss' ]
} )
export class BooleanFieldComponent extends AbstractFieldComponent {

	@Input() value: boolean;

	constructor () {

		super();

	}

}
