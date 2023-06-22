/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ScenarioInstance } from '../services/scenario-instance';
import { Act } from './tv-act';

/**
 * Instances of Story may be used to group independent parts of the scenario,
 * to make it easier to follow. If an Act is moved from one Story to another,
 * the scenario works in the same way, as long as there are no naming conflicts.
 */
export class Story {

	private static count = 1;

	public acts: Act[] = [];
	public hasStarted: boolean;
	public isCompleted: boolean;

	constructor ( public name: string, public ownerName: string ) {
		Story.count++;
	}

	static getNewName ( name = 'MyStory' ) {

		return `${ name }${ this.count }`;

	}

	addNewAct ( name: string ) {

		const act = new Act( name );

		this.addAct( act );

		return act;
	}

	addAct ( act: Act ) {

		// const hasName = ScenarioInstance.db.has_act( act.name );

		// if ( hasName ) throw new Error( `Act name '${ act.name }' has already been used` );

		this.acts.push( act );

		// ScenarioInstance.db.add_act( act.name, act );

	}

}
