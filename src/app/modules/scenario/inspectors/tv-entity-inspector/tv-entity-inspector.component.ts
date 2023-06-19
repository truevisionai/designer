/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { IComponent } from 'app/core/game-object';
import { ActionFactory } from '../../builders/action-factory';
import { ActionService } from '../../builders/action-service';
import { TvAction } from '../../models/tv-action';
import { PrivateAction } from '../../models/private-action';
import { EntityObject } from '../../models/tv-entities';
import { TvEvent } from '../../models/tv-event';
import { ActionType, ConditionType } from '../../models/tv-enums';
import { DialogService } from '../../services/tv-dialog.service';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';

@Component( {
	selector: 'app-tv-player-inspector',
	templateUrl: './tv-entity-inspector.component.html',
	styleUrls: [ './tv-entity-inspector.component.css' ]
} )
export class EntityInspector implements OnInit, IComponent {

	data: EntityObject;

	// @Input() entity: EntityObject;
	actionType = ActionType;
	conditionType = ConditionType;

	@ViewChild( 'addAction' ) addAction: MatSelect;
	@ViewChild( 'addCondition' ) addCondition: MatSelect;

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

	get scenarioActions (): PrivateAction[] {
		return this.scenario.findEntityActions( this.entity );
	}

	get scenarioEvents (): TvEvent[] {
		return this.scenario.findEntityEvents( this.entity );
	}

	addEvent ( $actionType: ActionType ) {

		if ( $actionType !== null ) {

			const action = ActionFactory.createAction( $actionType, this.entity );

			if ( action === null ) {
				return;
			}

			this.scenario.addActionEvent( this.entity, action );

			this.addAction.value = null;

		}
	}


	ngOnInit () {

	}

}
