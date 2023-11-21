// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvLane } from 'app/modules/tv-map/models/tv-lane';
// import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
// import { BaseCommand } from '../../commands/base-command';
// import { ICommand } from '../../commands/i-command';
// import { LaneWidthTool } from './lane-width-tool';
// import { UnselectLaneWidthNodeCommand } from './unselect-lane-width-node-command';

// export class SelectLaneForLaneWidthCommand extends BaseCommand {

// 	private newRoad: TvRoad;

// 	private oldRoad: TvRoad;
// 	private oldLane: TvLane;

// 	private unselectCommand: ICommand;

// 	constructor ( private tool: LaneWidthTool, private newLane: TvLane ) {

// 		super();

// 		this.oldLane = tool.lane;

// 		if ( newLane ) this.newRoad = this.map.getRoadById( this.newLane.roadId );
// 		if ( this.oldLane ) this.oldRoad = this.map.getRoadById( this.oldLane.roadId );

// 		this.unselectCommand = new UnselectLaneWidthNodeCommand( this.tool, this.tool.node );

// 	}

// 	execute (): void {

// 		this.oldRoad?.hideWidthNodes();

// 		this.tool.laneHelper.clear();

// 		this.newRoad?.showWidthNodes();

// 		this.tool.laneHelper.drawRoad( this.newRoad );

// 		this.tool.lane = this.newLane;

// 		this.unselectCommand.execute();
// 	}

// 	undo (): void {

// 		this.newRoad?.hideWidthNodes();

// 		this.tool.laneHelper.clear();

// 		this.oldRoad?.showWidthNodes();

// 		this.tool.laneHelper.drawRoad( this.oldRoad );

// 		this.tool.lane = this.oldLane;

// 		this.unselectCommand.undo();
// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }
