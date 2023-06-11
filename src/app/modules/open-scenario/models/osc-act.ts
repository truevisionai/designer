import { AbstractCondition } from './conditions/osc-condition';
import { OscConditionGroup } from './conditions/osc-condition-group';
import { OscSequence } from './osc-sequence';

export class OscAct {

	private static count = 1;

	public sequences: OscSequence[] = [];

	public startConditionGroups: OscConditionGroup[] = [];
	public cancelConditionGroups: OscConditionGroup[] = [];
	public endConditionGroups: OscConditionGroup[] = [];

	public shouldStart: boolean;
	public hasStarted: boolean;
	public isCompleted: boolean;

	constructor ( public name?: string ) {

		OscAct.count++;

	}

	static getNewName ( name = 'MyAct' ) {

		return `${ name }${ this.count }`;

	}

	addNewSequence ( name: string, numberOfExecutions: number, ...actors: string[] ) {

		const sequence = new OscSequence( name, numberOfExecutions, actors );

		this.sequences.push( sequence );

		return sequence;

	}

	addSequence ( sequence: OscSequence ) {

		this.sequences.push( sequence );

	}

	addStartCondition ( condition: AbstractCondition ) {
		if ( this.startConditionGroups.length == 0 ) {
			this.startConditionGroups.push( new OscConditionGroup() );
		}
		this.startConditionGroups[ 0 ].addCondition( condition );
	}
}
