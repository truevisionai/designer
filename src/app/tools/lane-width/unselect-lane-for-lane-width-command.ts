// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvLane } from 'app/modules/tv-map/models/tv-lane';
// import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

// import { BaseCommand } from '../../commands/base-command';
// import { ICommand } from '../../commands/i-command';
// import { LaneWidthTool } from './lane-width-tool';
// import { UnselectLaneWidthNodeCommand } from './unselect-lane-width-node-command';

// export class UnselectLaneForLaneWidthCommand extends BaseCommand {

// 	private readonly road: TvRoad;
// 	private unselectCommand: ICommand;

// 	constructor ( private tool: LaneWidthTool, private lane: TvLane ) {

// 		super();

// 		if ( lane ) this.road = this.map.getRoadById( this.lane.roadId );

// 		this.unselectCommand = new UnselectLaneWidthNodeCommand( this.tool, this.tool.node );

// 	}

// 	execute (): void {

// 		this.road?.hideWidthNodes();

// 		this.tool.laneHelper.clear();

// 		this.tool.lane = null;

// 		this.unselectCommand.execute();
// 	}

// 	undo (): void {

// 		this.road?.showWidthNodes();

// 		this.tool.laneHelper.drawRoad( this.road );

// 		this.tool.lane = this.lane;

// 		this.unselectCommand.undo();
// 	}

// 	redo (): void {

// 		this.execute();

// 	}
// }
