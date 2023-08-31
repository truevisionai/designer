/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneRoadmarkInspectorComponent } from 'app/views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
import { LaneRoadMarkNode } from '../../../modules/three-js/objects/lane-road-mark-node';
import { BaseCommand } from '../../commands/base-command';
import { ICommand } from '../../commands/i-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { LaneMarkingTool } from './lane-marking-tool';

export class UnselectRoadmarkNodeCommand extends BaseCommand {

	private inspectorCommand: ICommand;

	constructor (
		private tool: LaneMarkingTool,
		private node: LaneRoadMarkNode,
	) {

		super();

		this.inspectorCommand = new SetInspectorCommand( LaneRoadmarkInspectorComponent, null );

	}

	execute (): void {

		this.tool.node?.unselect();

		this.tool.node = null;

		this.inspectorCommand.execute();

	}

	undo (): void {

		this.tool.node?.unselect();

		this.tool.node = this.node;

		this.tool.node?.select();

		this.inspectorCommand.undo();

	}

	redo (): void {

		this.execute();

	}
}
