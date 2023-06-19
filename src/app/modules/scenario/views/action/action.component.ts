/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionType } from 'app/modules/scenario/models/tv-enums';
import { TvAction } from '../../models/tv-action';
import { PrivateAction } from '../../models/private-action';
import { EntityObject } from '../../models/tv-entities';

@Component( {
	selector: 'app-action',
	templateUrl: './action.component.html',
	styleUrls: [ './action.component.css' ]
} )
export class ActionComponent implements OnInit {

	@Input() action: TvAction;

	@Input() entity: EntityObject;

	@Output() removed = new EventEmitter<TvAction>();

	types = ActionType;

	constructor () {

		// console.log( this.action );

	}

	get privateAction () {

		return this.action as PrivateAction;

	}

	ngOnInit () {

		// console.log( this.action );

	}

	remove () {

		this.removed.emit( this.action );

	}

}
