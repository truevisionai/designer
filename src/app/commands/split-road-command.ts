/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { AddRoadCommand } from 'app/tools/road/add-road-command';
import { RemoveRoadCommand } from 'app/tools/road/remove-road-command';

export class SplitRoadCommand extends BaseCommand {

	constructor ( private removeCommand: RemoveRoadCommand, private addCommand: AddRoadCommand ) {

		super();

	}

	execute (): void {

		this.removeCommand.execute();

		this.addCommand.execute();

	}

	undo (): void {

		this.addCommand.undo();

		this.removeCommand.undo();

	}

	redo (): void {

		this.execute();

	}


}
