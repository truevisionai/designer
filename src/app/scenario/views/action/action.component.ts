/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionType } from 'app/scenario/models/tv-enums';
import { ScenarioEntity } from '../../models/entities/scenario-entity';
import { PrivateAction } from '../../models/private-action';
import { TvAction } from '../../models/tv-action';

@Component( {
	selector: 'app-action',
	templateUrl: './action.component.html',
	styleUrls: [ './action.component.css' ]
} )
export class ActionComponent implements OnInit {

	@Input() action: TvAction;

	@Input() entity: ScenarioEntity;

	@Output() removed = new EventEmitter<TvAction>();

	types = ActionType;

	@Input() isOpen = true;

	constructor () {

		// Debug.log( this.action );

	}

	get privateAction () {

		return this.action as PrivateAction;

	}

	ngOnInit () {

		// Debug.log( this.action );

	}

	toggle ( $event: MouseEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.isOpen = !this.isOpen;

	}

	deleteAction ( $event: MouseEvent ) {

		this.removed.emit( this.action );

	}
}
