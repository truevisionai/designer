/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { OscEntityObject } from '../models/osc-entities';
import { OscSourceFile } from '../services/osc-source-file';
import { OscEditor } from '../views/osc-editor/osc-editor';

export class OscAddEntityCommand extends BaseCommand {

	constructor ( public entity: OscEntityObject ) {
		super();
	}

	execute (): void {

		OscSourceFile.openScenario.addObject( this.entity );

		OscEditor.scenarioChanged.emit();
		OscSourceFile.scenarioChanged.emit();

	}

	undo (): void {

		OscEditor.deselect();

		var parent = this.entity.gameObject.parent;

		parent.remove( this.entity.gameObject );

		OscSourceFile.openScenario.removeObject( this.entity );

		OscEditor.scenarioChanged.emit();
		OscSourceFile.scenarioChanged.emit();

	}

	redo (): void {

		throw new Error( 'Method not implemented.' );

	}
}
