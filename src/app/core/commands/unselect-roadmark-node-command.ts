/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneRoadMarkNode } from 'app/modules/three-js/objects/control-point';
import { BaseCommand } from './base-command';
import { LaneMarkingTool } from '../tools/lane-marking-tool';
import { SetInspectorCommand } from './set-inspector-command';
import { LaneRoadmarkInspectorComponent } from 'app/views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
import { ICommand } from './i-command';

export class UnselectRoadmarkNodeCommand extends BaseCommand {

	private inspectorCommand: ICommand;

	constructor (
		private tool: LaneMarkingTool,
		private node: LaneRoadMarkNode,
	) {

		super();

		this.inspectorCommand = new SetInspectorCommand( LaneRoadmarkInspectorComponent, null )

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
