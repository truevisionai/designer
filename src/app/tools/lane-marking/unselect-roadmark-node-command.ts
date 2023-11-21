// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { LaneRoadmarkInspectorComponent } from 'app/views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
// import { LaneMarkingNode } from '../../modules/three-js/objects/lane-road-mark-node';
// import { BaseCommand } from '../../commands/base-command';
// import { ICommand } from '../../commands/i-command';
// import { SetInspectorCommand } from '../../commands/set-inspector-command';
// import { LaneMarkingTool } from './lane-marking-tool';

// export class UnselectRoadmarkNodeCommand extends BaseCommand {

// 	private inspectorCommand: ICommand;

// 	constructor (
// 		private tool: LaneMarkingTool,
// 		private node: LaneMarkingNode,
// 	) {

// 		super();

// 		this.inspectorCommand = new SetInspectorCommand( LaneRoadmarkInspectorComponent, null );

// 	}

// 	execute (): void {

// 		this.tool.selectedNode?.unselect();

// 		this.tool.selectedNode = null;

// 		this.inspectorCommand.execute();

// 	}

// 	undo (): void {

// 		this.tool.selectedNode?.unselect();

// 		this.tool.selectedNode = this.node;

// 		this.tool.selectedNode?.select();

// 		this.inspectorCommand.undo();

// 	}

// 	redo (): void {

// 		this.execute();

// 	}
// }
