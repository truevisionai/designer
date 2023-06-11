/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { OscAct } from './osc-act';

export class OscStory {

	private static count = 1;

	public acts: OscAct[] = [];
	public hasStarted: boolean;
	public isCompleted: boolean;

	constructor ( public name: string, public ownerName: string ) {
		OscStory.count++;
	}

	static getNewName ( name = 'MyStory' ) {

		return `${ name }${ this.count }`;

	}

	addNewAct ( name: string ) {

		const act = new OscAct( name );

		this.addAct( act );

		return act;
	}

	addAct ( act: OscAct ) {

		const hasName = TvScenarioInstance.db.has_act( act.name );

		if ( hasName ) throw new Error( `Act name '${ act.name }' has already been used` );

		this.acts.push( act );

		TvScenarioInstance.db.add_act( act.name, act );

	}

}
