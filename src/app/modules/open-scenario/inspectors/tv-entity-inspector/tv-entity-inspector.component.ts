/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { IComponent } from 'app/core/game-object';
import { AppInspector } from '../../../../core/inspector';
import { ActionService } from '../../builders/action-service';
import { EntityObject } from '../../models/tv-entities';
import { ActionType } from '../../models/tv-enums';
import { TvEvent } from '../../models/tv-event';
import { AbstractPrivateAction } from '../../models/tv-interfaces';
import { DialogService } from '../../services/tv-dialog.service';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ActionsInspectorComponent } from '../tv-actions-inspector/tv-player-actions-inspector.component';

@Component( {
	selector: 'app-tv-player-inspector',
	templateUrl: './tv-entity-inspector.component.html',
	styleUrls: [ './tv-entity-inspector.component.css' ]
} )
export class EntityInspector implements OnInit, IComponent {

	data: EntityObject;

	// @Input() entity: EntityObject;
	actionType = ActionType;

	@ViewChild( 'addAction' ) addAction: MatSelect;

	constructor (
		public dialog: MatDialog,
		private dialogService: DialogService,
		public actionService: ActionService,
	) {
	}

	get entity () {
		return this.data;
	}

	get initActions () {
		return this.entity.initActions;
	}

	get absolutePosition () {
		return this.entity.gameObject.position;
	};

	get scenario () {
		return TvScenarioInstance.openScenario;
	}

	get scenarioActions (): AbstractPrivateAction[] {
		return this.scenario.findEntityActions( this.entity );
	}

	get scenarioEvents (): TvEvent[] {
		return this.scenario.findEntityEvents( this.entity );
	}

	onAddAction ( $event ) {

		if ( $event !== null ) {

			const action = ActionService.getAction( $event, this.entity );

			if ( action === null ) {
				return;
			}

			this.scenario.addActionEvent( this.entity, action );

			this.addAction.value = null;

		}
	}

	ngOnInit () {

	}

	addInitActions () {

		this.dialogService.openAddEntityInitActionDialog( this.entity );

	}

	editPositionAction ( action ) {

		this.dialogService.openEditPositionDialog( action );

	}

	editStory () {

		this.dialogService.openStoryEditorDialog( this.entity );

	}

	editInitActions () {

		this.dialogService.openObjectInitEditorDialog( this.entity );

	}

	editActions () {

		// let actions = this.scenario.getActionsByEntity( this.entity.name );

		// Debug.log( actions );

		AppInspector.setInspector( ActionsInspectorComponent, this.entity );

	}

	editAct () {

		this.dialogService.openEditActDialog( this.entity );

	}
}
