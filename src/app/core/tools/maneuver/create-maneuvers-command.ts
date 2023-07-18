/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { JunctionEntryObject } from '../../../modules/three-js/objects/junction-entry.object';
import { BaseCommand } from '../../commands/base-command';
import { JunctionFactory } from '../../factories/junction.factory';

export class CreateManeuversCommand extends BaseCommand {

	constructor ( private entries: JunctionEntryObject[] ) {
		super();
	}

	execute (): void {

		JunctionFactory.mergeEntries( this.entries );

	}

	redo (): void {



	}

	undo (): void {
	}

}
