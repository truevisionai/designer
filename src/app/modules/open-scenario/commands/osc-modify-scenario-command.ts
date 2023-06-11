import { BaseCommand } from '../../../core/commands/base-command';
import { OpenScenario } from '../models/osc-scenario';
import { OscSourceFile } from '../services/osc-source-file';

export class OscModifyScenarioCommand extends BaseCommand {

	private oldState: OpenScenario;
	private newState: OpenScenario;

	constructor () {
		super();
	}

	execute (): void {
		OscSourceFile.openScenario = this.newState;
	}

	undo (): void {
		OscSourceFile.openScenario = this.oldState;
	}

	redo (): void {
		OscSourceFile.openScenario = this.newState;
	}

}
