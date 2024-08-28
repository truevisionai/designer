/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from '../abstract-field.component';

@Component( {
	selector: 'app-textarea-field',
	templateUrl: './textarea-field.component.html',
} )
export class TextareaFieldComponent extends AbstractFieldComponent<string> {

	@Input() value: string;

	constructor () {
		super();
	}

}
