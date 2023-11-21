// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */
//
// import { BaseCommand } from 'app/commands/base-command';
// import { SetValueCommand } from 'app/commands/set-value-command';
// import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
// import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
// import { RoadElevationTool } from './road-elevation-tool';
// import { ElevationManager } from 'app/managers/elevation-manager';
// import { MapEvents, RoadSelectedEvent, RoadUnselectedEvent } from "../../events/map-events";
//
// export class ShowElevationNodes extends BaseCommand {
//
// 	setValueCommand: SetValueCommand<RoadElevationTool, 'selectedRoad'>;
//
// 	constructor ( private tool: RoadElevationTool, private newRoad: TvRoad, private oldRoad: TvRoad ) {
//
// 		super();
//
// 		this.setValueCommand = new SetValueCommand( this.tool, 'selectedRoad', this.newRoad );
//
// 	}
//
// 	execute (): void {
//
// 		if ( this.newRoad ) MapEvents.roadSelected.emit( new RoadSelectedEvent( this.newRoad ) );
// 		if ( this.oldRoad ) MapEvents.roadUnselected.emit( new RoadUnselectedEvent( this.oldRoad ) );
//
// 		this.setValueCommand.execute();
//
// 	}
//
// 	undo (): void {
//
// 		this.setValueCommand.undo();
//
// 		if ( this.newRoad ) MapEvents.roadUnselected.emit( new RoadUnselectedEvent( this.newRoad ) );
// 		if ( this.oldRoad ) MapEvents.roadSelected.emit( new RoadSelectedEvent( this.oldRoad ) );
//
// 	}
//
// 	redo (): void {
//
// 		this.execute();
//
// 	}
//
// }
//
// export class HideElevationNodes extends BaseCommand {
//
// 	constructor (
// 		private tool: RoadElevationTool,
// 		private oldRoad: TvRoad,
// 		private oldNode: RoadElevationNode
// 	) {
//
// 		super();
//
// 	}
//
// 	execute (): void {
//
// 		MapEvents.roadUnselected.emit( new RoadUnselectedEvent( this.oldRoad ) );
//
// 		this.oldNode?.unselect();
//
// 		this.tool.selectedRoad = null;
//
// 		this.tool.node = null;
// 	}
//
// 	undo (): void {
//
// 		MapEvents.roadSelected.emit( new RoadSelectedEvent( this.oldRoad ) );
//
// 		this.oldNode?.select();
//
// 		this.tool.selectedRoad = this.oldRoad;
//
// 		this.tool.node = this.oldNode;
//
// 	}
//
// 	redo (): void {
//
// 		this.execute();
//
// 	}
//
// }
