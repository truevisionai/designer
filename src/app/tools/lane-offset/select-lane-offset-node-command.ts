///*
// * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
// */
//
//import { LaneOffsetInspector } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
//import { LaneOffsetNode } from '../../modules/three-js/objects/lane-offset-node';
//import { BaseCommand } from '../../commands/base-command';
//import { SetInspectorCommand } from '../../commands/set-inspector-command';
//import { LaneOffsetTool } from './lane-offset-tool';
//
//export class SelectLaneOffsetNodeCommand extends BaseCommand {
//
//	private readonly oldNode: LaneOffsetNode;
//
//	private inspectorCommand: any;
//
//	constructor (
//		private tool: LaneOffsetTool,
//		private newNode: LaneOffsetNode,
//	) {
//
//		super();
//
//		this.oldNode = this.tool.node;
//
//		this.inspectorCommand = new SetInspectorCommand( LaneOffsetInspector, newNode?.laneOffset );
//
//	}
//
//	execute (): void {
//
//		this.oldNode?.unselect();
//
//		this.tool.node = this.newNode;
//
//		this.newNode?.select();
//
//		this.inspectorCommand.execute();
//
//	}
//
//	undo (): void {
//
//		this.newNode?.unselect();
//
//		this.tool.node = this.oldNode;
//
//		this.newNode?.select();
//
//		this.inspectorCommand.undo();
//
//	}
//
//	redo (): void {
//
//		this.execute();
//
//	}
//}
