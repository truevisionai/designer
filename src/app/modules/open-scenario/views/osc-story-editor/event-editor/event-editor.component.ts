import { Component, Input, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import {
	ChooseConditionDialogComponent
} from 'app/modules/open-scenario/dialogs/choose-condition-dialog/choose-condition-dialog.component';
import { AbstractCondition } from 'app/modules/open-scenario/models/conditions/osc-condition';
import { OscEvent } from 'app/modules/open-scenario/models/osc-event';
import { AbstractAction } from 'app/modules/open-scenario/models/osc-interfaces';
import { OscDialogService } from 'app/modules/open-scenario/services/osc-dialog.service';

@Component( {
	selector: 'app-event-editor',
	templateUrl: './event-editor.component.html',
	styleUrls: [ './event-editor.component.css' ]
} )
export class EventEditorComponent implements OnInit, IComponent {

	data: any;

	@Input() event: OscEvent;

	@Input() action?: AbstractAction;

	constructor (
		private dialogService: OscDialogService
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
