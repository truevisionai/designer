// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
// import { SnackBar } from 'app/services/snack-bar.service';
// import { LaneWidthNode } from '../modules/three-js/objects/lane-width-node';
// import { SceneService } from '../services/scene.service';
// import { BaseCommand } from './base-command';
// import { MapEvents } from 'app/events/map-events';

// export class RemoveWidthNodeCommand extends BaseCommand {

// 	constructor (
// 		private node: LaneWidthNode,
// 	) {
// 		super();
// 	}

// 	execute (): void {

// 		const index = this.node.lane.width.findIndex( laneWidth => laneWidth.uuid === this.node.laneWidth.uuid );

// 		if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
// 		if ( index === -1 ) return;

// 		this.node.lane.width.splice( index, 1 );

// 		this.node.updateLaneWidthValues();

// 		MapEvents.laneUpdated.emit( this.node.lane );

// 		// ( new SetInspectorCommand( LaneWidthInspector, this.node.laneWidth ) ).execute();
// 	}

// 	undo (): void {

// 		this.node.lane.addWidthRecordInstance( this.node.laneWidth );

// 		this.node.updateLaneWidthValues();

// 		SceneService.addToolObject( this.node );

// 		MapEvents.laneUpdated.emit( this.node.lane );

// 		// ( new SetInspectorCommand( LaneWidthInspector, this.node.laneWidth ) ).execute();

// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// 	rebuild ( road: TvRoad ): void {

// 		MapEvents.laneUpdated.emit( this.node.lane );

// 		// this.laneHelper.drawRoad( road, LineType.SOLID, true );
// 	}

// }
