/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/core/services/scene.service';
import { TvConsole } from 'app/core/utils/console';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { EntityCondition } from '../models/conditions/entity-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { TvScenario } from '../models/tv-scenario';
import { Storyboard } from '../models/tv-storyboard';

/**
 * This class is responsible for building the scenario
 */
export class ScenarioBuilder {

	public static buildScenario ( scenario: TvScenario ): void {

		scenario.objects.forEach( ( value, key ) => this.buildEntityObject( value ) );

		scenario.executeInitActions();

		this.replaceVariables( scenario );

		this.addEndCondition( scenario.storyboard );

	}

	static replaceVariables ( scenario: TvScenario ) {

		this.replaceOwnerVariables( scenario );

	}

	static replaceOwnerVariables ( scenario: TvScenario ) {

		scenario.storyboard.stories.forEach( ( story ) => {

			story.acts.forEach( ( act ) => {

				const ownerName = story.getParameterValue<string>( 'owner' );

				act.maneueverGroups.forEach( ( sequence ) => {

					const index = sequence.actors.findIndex( actor => actor === 'owner' );

					if ( index >= 0 ) sequence.actors[ index ] = ownerName;

					sequence.maneuvers.forEach( ( maneuver ) => {

						maneuver.events.forEach( ( event ) => {

							event.actions.forEach( ( action ) => {

								this.replaceVariablesHelper( action, new Map<string, any>( [ [ 'owner', ownerName ] ] ) );

								if ( action instanceof LaneChangeAction || action instanceof SpeedAction ) {

									this.replaceVariablesHelper( action.target, new Map<string, any>( [ [ 'owner', ownerName ] ] ) );

								}

							} );

							event.startConditions.filter( c => c instanceof EntityCondition ).forEach( ( condition: EntityCondition ) => {

								const index = condition.triggeringEntities.findIndex( entity => entity === 'owner' );

								if ( index >= 0 ) condition.triggeringEntities[ index ] = ownerName;

							} );

						} );


					} );

				} );

			} );

		} );
	}

	static replaceVariablesHelper ( obj: any, variables: Map<string, any>, depth: number = 0 ) {
		// Limit recursion depth
		if ( depth > 10 ) {
			return obj;
		}

		if ( obj instanceof Array ) {
			// For arrays, replace variables in each element
			for ( let i = 0; i < obj.length; i++ ) {
				obj[ i ] = this.replaceVariablesHelper( obj[ i ], variables, depth + 1 );
			}
		} else if ( obj instanceof Object ) {
			// For objects, replace variables in each property
			for ( const key in obj ) {
				obj[ key ] = this.replaceVariablesHelper( obj[ key ], variables, depth + 1 );
			}
		} else if ( typeof obj === 'string' && obj.startsWith( '$' ) ) {
			// For strings starting with '$', replace with the corresponding variable value
			const varName = obj;
			if ( variables.has( varName ) ) {
				obj = variables.get( varName );
			}
		}
		return obj;
	}

	static addEndCondition ( storyboard: Storyboard ) {

		// if already has end conditions then return
		if ( storyboard.endConditionGroups.length > 0 ) return;

		TvConsole.warn( 'Storyboard has not EndCondition. Adding SimulationTimeCondition' );

		storyboard.addEndCondition( new SimulationTimeCondition( 60 ) );

	}

	static buildEntityObject ( entity: ScenarioEntity ): void {

		if ( entity ) {

			entity.visible = true;

			SceneService.add( entity );

		} else {

			throw new Error( 'create entity game object' );

		}

	}

}
