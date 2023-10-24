/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/core/services/scene.service';
import { TvConsole } from 'app/core/utils/console';
import { XmlElement } from 'app/modules/tv-map/services/open-drive-parser.service';
import { cloneDeep } from 'lodash';
import { isObject } from 'rxjs/internal-compatibility';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { TvScenario } from '../models/tv-scenario';
import { Storyboard } from '../models/tv-storyboard';


/**
 * This class is responsible for building the scenario
 */
export class ScenarioBuilder {

	constructor (
		public scenario: TvScenario
	) {
	}

	private static addEndCondition ( storyboard: Storyboard ) {

		// if already has end conditions then return
		if ( storyboard.endConditionGroups.length > 0 ) return;

		TvConsole.warn( 'Storyboard has not EndCondition. Adding SimulationTimeCondition' );

		storyboard.addEndCondition( new SimulationTimeCondition( 60 ) );

	}

	private static buildEntityObject ( entity: ScenarioEntity ): void {

		if ( !entity ) TvConsole.error( 'Entity is null' );

		entity.visible = true;

		SceneService.addToMain( entity );

	}

	public buildScenario (): void {

		this.scenario.objects.forEach( ( value, key ) => ScenarioBuilder.buildEntityObject( value ) );

		this.scenario.executeInitActions();

		ScenarioBuilder.addEndCondition( this.scenario.storyboard );

		// return this.scenario;

	}

}


export class ParameterResolver {

	private params = {};

	constructor (
		private scenario: Partial<TvScenario> = null,
		private scenarioString: string = null
	) {
	}

	setScenarioString ( value: string ) {

		this.scenarioString = value;
	}

	setScenario ( value: Partial<TvScenario> ) {

		this.scenario = value;

	}

	buildScenario (): string {

		return this.scenarioString;

	}

	replaceParameterWithValue ( obj: XmlElement ): XmlElement {

		return this.replaceParams( obj );

	}

	// Checks if obj is an iterable object (array, string, etc.)
	isIterable ( obj: any ): boolean {

		return obj != null && typeof obj[ Symbol.iterator ] === 'function';

	}

	replaceParams ( obj: Object ): Object {

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
				if ( this.isIterable( newObj[ key ] ) ) {

					// Update params with the new parameter declaration
					for ( let param of newObj[ key ] ) {
						this.params[ param.attr_name ] = param.attr_value;
					}

				} else {

					// If newObj[key] is not iterable, treat it as a single object
					this.params[ newObj[ key ].attr_name ] = newObj[ key ].attr_value;
				}

			} else {

				if ( typeof newObj[ key ] === 'string' && newObj[ key ].startsWith( '$' ) ) {

					// Replace parameterized value with the corresponding parameter value
					newObj[ key ] = this.params[ newObj[ key ].substring( 1 ) ];

				} else if ( isObject( newObj[ key ] ) ) {

					// Recursively process child objects
					newObj[ key ] = this.replaceParams( newObj[ key ] );
				}
			}
		}

		return newObj;
	}
}
