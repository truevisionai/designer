/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Act } from './tv-act';
import { ParameterDeclaration } from './tv-parameter-declaration';

interface StoryboardElement {
}

/**
 * Instances of Story may be used to group independent parts of the scenario,
 * to make it easier to follow. If an Act is moved from one Story to another,
 * the scenario works in the same way, as long as there are no naming conflicts.
 */
export class Story implements StoryboardElement {

	private static count = 1;

	public acts: Act[] = [];
	public hasStarted: boolean;
	public isCompleted: boolean;

	public parameterDeclarations: ParameterDeclaration[] = [];

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

	addParameterDeclaration ( parameterDeclaration: ParameterDeclaration ) {
		this.parameterDeclarations.push( parameterDeclaration );
	}

	getParameterValue<T> ( name: string ): T {

		let parameterDeclaration = this.parameterDeclarations.find( p => p.parameter.name === name );

		// try with $ prefix
		if ( !parameterDeclaration ) {
			parameterDeclaration = this.parameterDeclarations.find( p => p.parameter.name === `$` + name );
		}

		if ( !parameterDeclaration ) throw new Error( `Parameter declaration for '${ name }' not found` );

		return parameterDeclaration.parameter.getValue<T>();

	}
}
