/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetNode, LaneRoadMarkNode } from 'app/modules/three-js/objects/control-point';
import { BaseCommand } from './base-command';
import { LaneMarkingTool } from '../tools/lane-marking-tool';
import { SetInspectorCommand } from './set-inspector-command';
import { LaneRoadmarkInspectorComponent } from 'app/views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
import { LaneOffsetTool } from '../tools/lane-offset-tool';
import { LaneOffsetInspector } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';

export class SelectLaneOffsetNodeCommand extends BaseCommand {

	private readonly oldNode: LaneOffsetNode;

	private inspectorCommand: any;

	constructor (
		private tool: LaneOffsetTool,
		private newNode: LaneOffsetNode,
	) {

		super();

		this.oldNode = this.tool.node;

		this.inspectorCommand = new SetInspectorCommand( LaneOffsetInspector, newNode?.laneOffset )

	}

	execute (): void {

		this.oldNode?.unselect();

		this.tool.node = this.newNode;

		this.newNode?.select();

		this.inspectorCommand.execute();

	}

	undo (): void {

		this.newNode?.unselect();

		this.tool.node = this.oldNode;

		this.newNode?.select();

		this.inspectorCommand.undo();

	}

	redo (): void {

		this.execute();

	}
}
