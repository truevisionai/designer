/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from '../../../core/commands/base-command';
import { OpenScenario } from '../models/osc-scenario';
import { TvScenarioInstance } from '../services/tv-scenario-instance';

export class OscModifyScenarioCommand extends BaseCommand {

	private oldState: OpenScenario;
	private newState: OpenScenario;

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
