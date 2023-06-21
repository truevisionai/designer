import { SceneService } from "app/core/services/scene.service";
import { EntityObject } from "../models/tv-entities";
import { TvScenario } from "../models/tv-scenario";
import { SimulationTimeCondition } from "../models/conditions/tv-simulation-time-condition";
import { Storyboard } from "../models/tv-storyboard";
import { TvConsole } from "app/core/utils/console";
import { EntityCondition } from "../models/conditions/entity-condition";
import { PrivateAction } from "../models/private-action";
import { LaneChangeAction } from "../models/actions/tv-lane-change-action";
import { SpeedAction } from "../models/actions/tv-speed-action";

export class ScenarioBuilder {

	public static buildScenario ( scenario: TvScenario ): void {

		scenario.objects.forEach( ( value, key ) => this.buildEntityObject( value ) )

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

				// // Initialize the variables map with the 'owner' variable
				// const variables = new Map<string, any>();

				// variables.set( 'owner', story.ownerName );

				// // Replace variables in the entire scenario object
				// this.replaceVariablesHelper( story, variables );

				act.sequences.forEach( ( sequence ) => {

					const index = sequence.actors.findIndex( actor => actor === '$owner' );

					if ( index >= 0 ) sequence.actors[ index ] = story.ownerName;

					sequence.maneuvers.forEach( ( maneuver ) => {

						maneuver.events.forEach( ( event ) => {

							event.actions.forEach( ( action ) => {

								this.replaceVariablesHelper( action, new Map<string, any>( [ [ '$owner', story.ownerName ] ] ) );

								if ( action instanceof LaneChangeAction || action instanceof SpeedAction ) {

									this.replaceVariablesHelper( action.target, new Map<string, any>( [ [ '$owner', story.ownerName ] ] ) );

								}

							} );

							event.startConditions.filter( c => c instanceof EntityCondition ).forEach( ( condition: EntityCondition ) => {

								const index = condition.triggeringEntities.findIndex( entity => entity === '$owner' );

								if ( index >= 0 ) condition.triggeringEntities[ index ] = story.ownerName;

							} );

						} );


					} );

				} )

			} )

		} )
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

		TvConsole.warn( "Storyboard has not EndCondition. Adding SimulationTimeCondition" )

		storyboard.addEndCondition( new SimulationTimeCondition( 60 ) );

	}

	static buildEntityObject ( value: EntityObject ): void {

		if ( value.gameObject ) {

			value.gameObject.visible = true;

			SceneService.add( value?.gameObject );

		} else {

			throw new Error( "create entity game object" );

		}

	}

}