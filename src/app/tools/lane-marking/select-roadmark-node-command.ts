/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneRoadmarkInspectorComponent } from 'app/views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
import { LaneRoadMarkNode } from '../../modules/three-js/objects/lane-road-mark-node';
import { BaseCommand } from '../../commands/base-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { LaneMarkingTool } from './lane-marking-tool';

export class SelectRoadmarNodeCommand extends BaseCommand {

	private readonly oldNode: LaneRoadMarkNode;

	private inspectorCommand: any;

	constructor (
		private tool: LaneMarkingTool,
		private newNode: LaneRoadMarkNode,
	) {

		super();

		this.oldNode = this.tool.node;

		this.inspectorCommand = new SetInspectorCommand( LaneRoadmarkInspectorComponent, newNode?.roadmark );

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

		this.oldNode?.select();

		this.inspectorCommand.undo();

	}

	redo (): void {

		this.execute();

	}
}
