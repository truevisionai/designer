/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IComponent } from 'app/objects/game-object';
import { ScenarioEntity } from '../../models/entities/scenario-entity';
import { PrivateAction } from '../../models/private-action';
import { ActionType, ConditionType } from '../../models/tv-enums';
import { TvEvent } from '../../models/tv-event';
import { Maneuver } from '../../models/tv-maneuver';
import { ScenarioService } from '../../services/scenario.service';
import { ScenarioElementFactory } from "../../builders/scenario-element-factory";

@Component( {
	selector: 'app-tv-player-inspector',
	templateUrl: './tv-entity-inspector.component.html',
	styleUrls: [ './tv-entity-inspector.component.css' ]
} )
export class EntityInspector implements OnInit, IComponent {

	@Input() data: ScenarioEntity;

	actionType = ActionType;

	conditionType = ConditionType;

	debug: boolean = false;

	constructor (
		public dialog: MatDialog,
		public scenarioService: ScenarioService,
		public scenarioElementFactory: ScenarioElementFactory
	) {
	}

	get entity () {
		return this.data;
	}

	get initActions () {
		return this.entity.initActions;
	}

	get absolutePosition () {
		return this.entity.position;
	};

	get scenario () {
		return this.scenarioService.getScenario();
	}

	get scenarioActions (): PrivateAction[] {
		return this.scenario.findEntityActions( this.entity );
	}

	get scenarioEvents (): TvEvent[] {
		return this.scenario.findEntityEvents( this.entity );
	}

	get scenarioManeuevers (): Maneuver[] {
		return this.scenario.getManeuversForEntity( this.entity.name );
	}

	addEvent ( $actionType: ActionType ) {

		if ( $actionType !== null ) {

			const story = this.scenarioElementFactory.makeStory( this.entity, $actionType );

			this.scenario.addStory( story );

		}
	}

	addManeuever () {

	}

	ngOnInit () {

	}

	removeInitAction ( action: PrivateAction ) {

		this.entity.removeInitAction( action );

	}
}
