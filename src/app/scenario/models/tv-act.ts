/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Condition } from './conditions/tv-condition';
import { ConditionGroup } from './conditions/tv-condition-group';
import { ManeuverGroup } from './tv-sequence';

/**
 * An Act allows a set of multiple instances of Trigger
 * to determine when the specific Act starts.
 * An Act may be terminated by a stopTrigger
 */
export class Act {

	private static count = 1;

	public maneueverGroups: ManeuverGroup[] = [];

	public startConditionGroups: ConditionGroup[] = [];
	public cancelConditionGroups: ConditionGroup[] = [];
	public endConditionGroups: ConditionGroup[] = [];

	public shouldStart: boolean;
	public hasStarted: boolean;
	public isCompleted: boolean;

	constructor ( public name?: string ) {

		Act.count++;

	}

	static getNewName ( name = 'MyAct' ): string {

		return `${ name }${ this.count }`;

	}

	addNewSequence ( name: string, numberOfExecutions: number = 1, ...actors: string[] ): ManeuverGroup {

		const sequence = new ManeuverGroup( name, numberOfExecutions, actors );

		this.maneueverGroups.push( sequence );

		return sequence;

	}

	addManeuverGroup ( sequence: ManeuverGroup ): void {

		this.maneueverGroups.push( sequence );

	}

	addStartCondition ( condition: Condition ): void {
		if ( this.startConditionGroups.length == 0 ) {
			this.startConditionGroups.push( new ConditionGroup() );
		}
		this.startConditionGroups[ 0 ].addCondition( condition );
	}

	addEndCondition ( condition: Condition ): void {

		if ( this.endConditionGroups.length == 0 ) {
			this.endConditionGroups.push( new ConditionGroup() );
		}

		this.endConditionGroups[ 0 ].addCondition( condition );
	}
}
