/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetInspector } from "app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component";
import { SetInspectorCommand } from "./set-inspector-command";
import { BaseCommand } from "./base-command";
import { LaneOffsetTool } from "../tools/lane-offset-tool";
import { ICommand } from "./i-command";
import { LaneOffsetNode } from "app/modules/three-js/objects/control-point";


export class UnselectLaneOffsetNodeCommand extends BaseCommand {

	private inspectorCommand: ICommand;

	constructor (
		private tool: LaneOffsetTool,
		private node: LaneOffsetNode,
	) {

		super();

		this.inspectorCommand = new SetInspectorCommand( LaneOffsetInspector, null )

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
