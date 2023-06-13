/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
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

	types = ActionType;

	constructor () {

	}

	get privateAction () {
		return this.action as AbstractPrivateAction;
	}

	ngOnInit () {


	}

}
