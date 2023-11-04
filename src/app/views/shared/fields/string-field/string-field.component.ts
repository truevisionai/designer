/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';

@Component( {
	selector: 'app-string-field',
	templateUrl: './string-field.component.html',
} )
export class StringFieldComponent extends AbstractFieldComponent {

	@Input() value: any;

	constructor () {

		super();

	}

}
