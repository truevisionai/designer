/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionType } from 'app/modules/open-scenario/models/tv-enums';
import { AbstractAction, AbstractPrivateAction } from 'app/modules/open-scenario/models/tv-interfaces';
import { EntityObject } from '../../../models/tv-entities';

@Component( {
	selector: 'app-action-editor',
	templateUrl: './action-editor.component.html',
	styleUrls: [ './action-editor.component.css' ]
} )
export class ActionEditorComponent implements OnInit {

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
