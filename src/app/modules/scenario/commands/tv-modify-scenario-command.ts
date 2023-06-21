/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from '../../../core/commands/base-command';
import { TvScenario } from '../models/tv-scenario';
import { TvScenarioInstance } from '../services/tv-scenario-instance';

export class ModifyScenarioCommand extends BaseCommand {

	private oldState: TvScenario;
	private newState: TvScenario;

	constructor () {
		super();
	}

	execute (): void {
		TvScenarioInstance.openScenario = this.newState;
	}

	undo (): void {
		TvScenarioInstance.openScenario = this.oldState;
	}

	redo (): void {
		TvScenarioInstance.openScenario = this.newState;
	}

}
