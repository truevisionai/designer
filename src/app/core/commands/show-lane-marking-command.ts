/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { AppInspector } from '../inspector';
import { LaneMarkingTool } from '../tools/lane-marking-tool';
import { BaseCommand } from './base-command';

export class ShowLaneMarkingCommand extends BaseCommand {

	private newRoad: TvRoad;

	private oldRoad: TvRoad;
	private oldLane: TvLane;

	private lastInspector: any;
	private lastInspectorData: any;

	constructor ( private tool: LaneMarkingTool, private newLane: TvLane ) {

		super();

		this.oldLane = tool.lane;

		if ( newLane ) this.newRoad = this.map.getRoadById( this.newLane.roadId );
		if ( this.oldLane ) this.oldRoad = this.map.getRoadById( this.oldLane.roadId );

		this.lastInspector = AppInspector.currentInspector;
		this.lastInspectorData = AppInspector.currentInspectorData;

	}

	execute (): void {

		if ( this.oldRoad ) this.hideNodes( this.oldRoad );
		if ( this.newRoad ) this.showNodes( this.newRoad );

		this.tool.lane = this.newLane;

		AppInspector.setInspector( LaneInspectorComponent, this.newLane );
	}

	undo (): void {

		if ( this.newRoad ) this.hideNodes( this.newRoad );
		if ( this.oldRoad ) this.showNodes( this.oldRoad );

		this.tool.lane = this.oldLane;

		AppInspector.setInspector( this.lastInspector, this.lastInspectorData );
	}

	redo (): void {

		this.execute();

	}

	private showNodes ( road: TvRoad ) {

		road.showLaneMarkingNodes();

		this.tool.laneHelper.drawRoad( road );
	}

	private hideNodes ( road: TvRoad ) {

		road.hideLaneMarkingNodes();

		this.tool.laneHelper.clear();
	}
}
