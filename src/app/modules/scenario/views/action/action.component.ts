/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionType } from 'app/modules/scenario/models/tv-enums';
import { AbstractAction } from '../../models/abstract-action';
import { AbstractPrivateAction } from '../../models/abstract-private-action';
import { EntityObject } from '../../models/tv-entities';

@Component( {
	selector: 'app-action',
	templateUrl: './action.component.html',
	styleUrls: [ './action.component.css' ]
} )
export class ActionComponent implements OnInit {

	@Input() action: AbstractAction;

	@Input() entity: EntityObject;

	@Output() removed = new EventEmitter<AbstractAction>();

	types = ActionType;

	constructor () {

	}

	get privateAction () {
		return this.action as AbstractPrivateAction;
	}

	ngOnInit () {


	}

	remove () {

		this.removed.emit( this.action );

	}

}
