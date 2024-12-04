/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Act } from './tv-act';
import { ParameterDeclaration } from './tv-parameter-declaration';

/**
 * Instances of Story may be used to group independent parts of the scenario,
 * to make it easier to follow. If an Act is moved from one Story to another,
 * the scenario works in the same way, as long as there are no naming conflicts.
 */
export class Story {

	public acts: Act[] = [];

	public hasStarted: boolean;

	public isCompleted: boolean;

	public parameterDeclarations: ParameterDeclaration[] = [];

	constructor (
		public name: string,
		public ownerName: string
	) {
	}

	addAct ( act: Act ): void {
		this.acts.push( act );
	}

	addParameterDeclaration ( parameterDeclaration: ParameterDeclaration ): void {
		this.parameterDeclarations.push( parameterDeclaration );
	}

}
