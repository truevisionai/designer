/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { EntityObject } from '../models/tv-entities';
import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { Editor } from '../views/tv-editor/tv-editor';

export class AddEntityCommand extends BaseCommand {

	constructor ( public entity: EntityObject ) {
		super();
	}

	execute (): void {

		TvScenarioInstance.openScenario.addObject( this.entity );

		Editor.scenarioChanged.emit();
		TvScenarioInstance.scenarioChanged.emit();

	}

	undo (): void {

		Editor.deselect();

		var parent = this.entity.gameObject.parent;

		parent.remove( this.entity.gameObject );

		TvScenarioInstance.openScenario.removeObject( this.entity );

		Editor.scenarioChanged.emit();
		TvScenarioInstance.scenarioChanged.emit();

	}

	redo (): void {

		throw new Error( 'Method not implemented.' );

	}
}
