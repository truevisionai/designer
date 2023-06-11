/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractCondition } from './conditions/osc-condition';
import { ConditionGroup } from './conditions/osc-condition-group';
import { Sequence } from './osc-sequence';

export class Act {

	private static count = 1;

	public sequences: Sequence[] = [];

	public startConditionGroups: ConditionGroup[] = [];
	public cancelConditionGroups: ConditionGroup[] = [];
	public endConditionGroups: ConditionGroup[] = [];

	public shouldStart: boolean;
	public hasStarted: boolean;
	public isCompleted: boolean;

	constructor ( public name?: string ) {

		Act.count++;

	}

	static getNewName ( name = 'MyAct' ) {

		return `${ name }${ this.count }`;

	}

	addNewSequence ( name: string, numberOfExecutions: number, ...actors: string[] ) {

		const sequence = new Sequence( name, numberOfExecutions, actors );

		this.sequences.push( sequence );

		return sequence;

	}

	addSequence ( sequence: Sequence ) {

		this.sequences.push( sequence );

	}

	addStartCondition ( condition: AbstractCondition ) {
		if ( this.startConditionGroups.length == 0 ) {
			this.startConditionGroups.push( new ConditionGroup() );
		}
		this.startConditionGroups[ 0 ].addCondition( condition );
	}
}
