/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { AbstractFieldComponent } from 'app/views/shared/fields/abstract-field.component';

@Component( {
	selector: 'app-boolean-field',
	templateUrl: './boolean-field.component.html',
	styleUrls: [ './boolean-field.component.scss' ]
} )
export class BooleanFieldComponent extends AbstractFieldComponent<boolean> {

	@Input() value: boolean;

	constructor () {

		super();

	}

}
