// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { LaneRoadmarkInspectorComponent } from 'app/views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
// import { LaneMarkingNode } from '../../modules/three-js/objects/lane-road-mark-node';
// import { BaseCommand } from '../../commands/base-command';
// import { SetInspectorCommand } from '../../commands/set-inspector-command';
// import { LaneMarkingTool } from './lane-marking-tool';

// export class SelectRoadmarNodeCommand extends BaseCommand {

// 	private readonly oldNode: LaneMarkingNode;

// 	private inspectorCommand: any;

// 	constructor (
// 		private tool: LaneMarkingTool,
// 		private newNode: LaneMarkingNode,
// 	) {

// 		super();

// 		this.oldNode = this.tool.selectedNode;

// 		this.inspectorCommand = new SetInspectorCommand( LaneRoadmarkInspectorComponent, newNode?.roadmark );

// 	}

// 	execute (): void {

// 		this.oldNode?.unselect();

// 		this.tool.selectedNode = this.newNode;

// 		this.newNode?.select();

// 		this.inspectorCommand.execute();

// 	}

// 	undo (): void {

// 		this.newNode?.unselect();

// 		this.tool.selectedNode = this.oldNode;

// 		this.oldNode?.select();

// 		this.inspectorCommand.undo();

// 	}

// 	redo (): void {

// 		this.execute();

// 	}
// }
