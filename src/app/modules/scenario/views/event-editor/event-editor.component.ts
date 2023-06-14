/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import {
	ChooseConditionDialogComponent
} from 'app/modules/scenario/dialogs/choose-condition-dialog/choose-condition-dialog.component';
import { AbstractCondition } from 'app/modules/scenario/models/conditions/tv-condition';
import { TvEvent } from 'app/modules/scenario/models/tv-event';
import { AbstractAction } from 'app/modules/scenario/models/tv-interfaces';
import { DialogService } from 'app/modules/scenario/services/tv-dialog.service';

@Component( {
	selector: 'app-event-editor',
	templateUrl: './event-editor.component.html',
	styleUrls: [ './event-editor.component.css' ]
} )
export class EventEditorComponent implements OnInit, IComponent {

	data: any;

	@Input() event: TvEvent;

	@Input() action?: AbstractAction;

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

		const dialogRef = this.dialogService.dialog.open( ChooseConditionDialogComponent, {
			width: '260px',
			height: '400px',
			data: null
		} );

		dialogRef.afterClosed().subscribe( ( condition: AbstractCondition ) => {

			if ( condition != null ) this.event.addStartCondition( condition );

		} );

	}

}
