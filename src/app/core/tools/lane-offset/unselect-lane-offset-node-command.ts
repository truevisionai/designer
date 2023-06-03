/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetInspector } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
import { LaneOffsetNode } from '../../../modules/three-js/objects/lane-offset-node';
import { BaseCommand } from '../../commands/base-command';
import { ICommand } from '../../commands/i-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { LaneOffsetTool } from './lane-offset-tool';

export class UnselectLaneOffsetNodeCommand extends BaseCommand {

	private inspectorCommand: ICommand;

	constructor (
		private tool: LaneOffsetTool,
		private newNode: LaneOffsetNode,
	) {

		super();

		this.inspectorCommand = new SetInspectorCommand( LaneOffsetInspector, null );

	}

	execute (): void {

		this.newNode?.unselect();

		this.tool.node = null;

		this.inspectorCommand.execute();

	}

	undo (): void {

		this.tool.node?.unselect();

		this.tool.node = this.newNode;

		this.newNode?.select();

		this.inspectorCommand.undo();

	}

	redo (): void {

		this.execute();

	}
}
