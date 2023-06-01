/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetNode } from 'app/modules/three-js/objects/control-point';
import { LaneOffsetInspector } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
import { LaneOffsetTool } from '../tools/lane-offset-tool';
import { BaseCommand } from './base-command';
import { ICommand } from './i-command';
import { SetInspectorCommand } from './set-inspector-command';


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
