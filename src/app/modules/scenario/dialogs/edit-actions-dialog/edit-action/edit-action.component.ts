/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractPrivateAction } from '../../../models/abstract-private-action';

@Component( {
	selector: 'app-edit-action',
	templateUrl: './edit-action.component.html'
} )
export class EditActionComponent implements OnInit {

	@Input() action: AbstractPrivateAction;

	@Output() actionSelected = new EventEmitter<AbstractPrivateAction>();

	constructor () {
	}

	ngOnInit () {

	}

	selectAction () {

		this.actionSelected.emit( this.action );

	}

}
