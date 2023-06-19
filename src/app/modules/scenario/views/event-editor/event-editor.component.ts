/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { Condition } from 'app/modules/scenario/models/conditions/tv-condition';
import { TvEvent } from 'app/modules/scenario/models/tv-event';
import { DialogService } from 'app/modules/scenario/services/tv-dialog.service';
import { TvAction } from '../../models/tv-action';

@Component( {
	selector: 'app-event-editor',
	templateUrl: './event-editor.component.html',
	styleUrls: [ './event-editor.component.css' ]
} )
export class EventEditorComponent implements OnInit, IComponent {

	data: any;

	@Input() event: TvEvent;

	@Input() action?: TvAction;

	constructor (
		private dialogService: DialogService
	) {
	}

	get actions () {
		return this.event.getActions();
	}

	get conditions () {
		return this.event.startConditions;
	}

	ngOnInit () {
		this.event = this.data;
	}

	addCondition () {

		throw new Error( 'Not implemented' );

	}

}
