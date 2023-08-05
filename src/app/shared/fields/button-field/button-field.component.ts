/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';

@Component( {
	selector: 'app-button-field',
	templateUrl: './button-field.component.html',
	styleUrls: [ './button-field.component.scss' ]
} )
export class ButtonFieldComponent extends AbstractFieldComponent {

	@Input() value: any;

	@Input() disabled: boolean = false;

	@Input() label: string;

	constructor () {
		super();
	}


}
