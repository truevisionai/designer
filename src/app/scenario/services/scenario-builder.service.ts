/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from 'app/core/utils/console';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { TvScenario } from '../models/tv-scenario';
import { Storyboard } from '../models/tv-storyboard';
import { Injectable } from "@angular/core";
import { EntityBuilder } from "../entity/entity.builder";

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioBuilder {

	constructor (
		private entityBuilder: EntityBuilder
	) {
	}

	public buildScenario ( scenario: TvScenario ): void {

		scenario.objects.forEach( ( value, key ) => this.buildEntityObject( value ) );

		scenario.executeInitActions();

		this.addEndCondition( scenario.storyboard );

	}

	private addEndCondition ( storyboard: Storyboard ) {

		// if already has end conditions then return
		if ( storyboard.endConditionGroups.length > 0 ) return;

		TvConsole.warn( 'Storyboard has not EndCondition. Adding SimulationTimeCondition' );

		storyboard.addEndCondition( new SimulationTimeCondition( 60 ) );

	}

	private buildEntityObject ( entity: ScenarioEntity ): void {

		if ( !entity ) TvConsole.error( 'Entity is null' );

		entity.visible = true;

		const mesh = this.entityBuilder.build( entity );

		entity.mesh = mesh;

		entity.initActions.forEach( action => action.execute( entity ) );
	}

}

