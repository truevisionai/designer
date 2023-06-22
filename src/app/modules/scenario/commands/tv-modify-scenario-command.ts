/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from '../../../core/commands/base-command';
import { TvScenario } from '../models/tv-scenario';
import { ScenarioInstance } from '../services/scenario-instance';

export class ModifyScenarioCommand extends BaseCommand {

	private oldState: TvScenario;
	private newState: TvScenario;

	constructor () {
		super();
	}

	execute (): void {
		ScenarioInstance.scenario = this.newState;
	}

	undo (): void {
		ScenarioInstance.scenario = this.oldState;
	}

	redo (): void {
		ScenarioInstance.scenario = this.newState;
	}

}
