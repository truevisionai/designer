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
import { ParameterDeclaration } from '../models/tv-parameter-declaration';

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

export class ScenarioBuilderV2 {

	constructor (
		private scenario: Partial<TvScenario> = null,
		private scenarioString: string = null
	) { }

	setScenarioString ( value: string ) {
		this.scenarioString = value;
	}

	setScenario ( value: Partial<TvScenario> ) {
		this.scenario = value;
	}

	buildScenario (): string {

		this.scenario.parameterDeclarations.forEach( parameter =>
			this.replaceParameter( parameter )
		);

		return this.scenarioString;
	}

	replaceParameterWithValue ( obj: XmlElement ): XmlElement {

		return replaceParams( obj );

	}

	replaceParameter ( declaration: ParameterDeclaration ): void {

		const regex = new RegExp( '\\$' + declaration.parameter.name, 'g' );

		this.scenarioString = this.scenarioString.replace( regex, declaration.parameter.value );
	}

}

import { cloneDeep } from 'lodash';
import { isObject } from 'rxjs/internal-compatibility';
import { XmlElement } from 'app/modules/tv-map/services/open-drive-parser.service';

const params = {}

function isIterable ( obj: any ): boolean {
	// Checks if obj is an iterable object (array, string, etc.)
	return obj != null && typeof obj[ Symbol.iterator ] === 'function';
}

function replaceParams ( obj: any ): any {
	// If obj is not an object or is null, return it as is
	if ( !isObject( obj ) || obj === null ) {
		return obj;
	}

	// Deep clone obj to avoid mutating the original object
	let newObj = cloneDeep( obj );

	// Iterate over keys of newObj
	for ( let key of Object.keys( newObj ) ) {
		if ( key === 'ParameterDeclaration' ) {
			// Check if newObj[key] is iterable
			if ( isIterable( newObj[ key ] ) ) {
				// Update params with the new parameter declaration
				for ( let param of newObj[ key ] ) {
					params[ param.attr_name ] = param.attr_value;
				}
			} else {
				// If newObj[key] is not iterable, treat it as a single object
				params[ newObj[ key ].attr_name ] = newObj[ key ].attr_value;
			}
		} else {
			if ( typeof newObj[ key ] === 'string' && newObj[ key ].startsWith( '$' ) ) {
				// Replace parameterized value with the corresponding parameter value
				newObj[ key ] = params[ newObj[ key ].substring( 1 ) ];
			} else if ( isObject( newObj[ key ] ) ) {
				// Recursively process child objects
				newObj[ key ] = replaceParams( newObj[ key ] );
			}
		}
	}

	return newObj;
}

