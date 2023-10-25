/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { LaneWidthInspector } from '../../views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { BaseCommand } from '../../commands/base-command';
import { ICommand } from '../../commands/i-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { LaneWidthTool } from './lane-width-tool';


export class UnselectLaneWidthNodeCommand extends BaseCommand {

	private inspectorCommand: ICommand;

	constructor (
		private tool: LaneWidthTool,
		private node: LaneWidthNode,
	) {

		super();

		this.inspectorCommand = new SetInspectorCommand( LaneWidthInspector, null );

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
