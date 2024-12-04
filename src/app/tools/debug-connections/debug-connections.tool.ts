/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { RoadService } from "../../services/road/road.service";
import { MapService } from "../../services/map/map.service";
import { DebugTextService } from "../../services/debug/debug-text.service";
import { ToolTipService } from "../../services/debug/tool-tip.service";
import { ConnectionsDebugger } from "./connections.debugger";
import { Injectable } from "@angular/core";
import { MapQueryService } from "../../map/queries/map-query.service";
import { TvLaneCoord } from "../../map/models/tv-lane-coord";
import { Vector2 } from "three";
import { JunctionUtils } from "../../utils/junction.utils";
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Log } from 'app/core/utils/log';
import { RoadWidthService } from 'app/services/road/road-width.service';

@Injectable( {
	providedIn: 'root'
} )
export class DebugConnectionToolService {
	constructor (
		public roadService: RoadService,
		public mapService: MapService,
		public textService: DebugTextService,
		public toolTipService: ToolTipService,
		public toolDebugger: ConnectionsDebugger,
		public queryService: MapQueryService,
	) {
	}
}

export class DebugConnectionTool extends BaseTool<any> {

	public name: string = 'DebugTool';

	public toolType = ToolType.DebugConnections;
	private toolTip: any;

	constructor ( private tool: DebugConnectionToolService ) {

		super();

		this.setHint( 'This tool is used to debug connections, successors and predecessors of lanes' );

	}

	init (): void {

		super.init();

		this.setDebugService( this.tool.toolDebugger );

		this.tool.mapService.nonJunctionRoads.forEach( road => {

			// show road id in middle of the road

			const width = RoadWidthService.instance.findRoadWidthAt( road, road.length * 0.5 );

			if ( !width ) return;

			const t = width.leftSideWidth - width.rightSideWidth;

			const position = road.getRoadPosition( road.length * 0.5, t * 0.5 )?.position;

			if ( !position ) return;

			position.z += 0.01;

			DebugDrawService.instance.drawText( road.id.toString(), position, 2, COLOR.RED );

		} );

		this.tool.mapService.junctions.forEach( junction => {

			if ( !junction.centroid ) {
				Log.error( 'Junction position is not set', junction?.toString() );
				return;
			}

			DebugDrawService.instance.drawText( 'J:' + junction.toString(), junction.centroid, 2, COLOR.RED );

			DebugDrawService.instance.drawBox2D( junction.boundingBox, COLOR.WHITE, 0.5 );

		} );

		this.tool.mapService.nonJunctionSplines.forEach( spline => {

			this.tool.toolDebugger.roadToolDebugger.onDefault( spline );

		} );

	}

	disable (): void {

		super.disable();

		if ( this.toolTip ) {
			this.tool.toolTipService.clear();
			this.toolTip = null;
		}

		DebugDrawService.instance.clear();
	}

	onPointerDown ( pointerEventData: PointerEventData ): void {

		const coord = this.tool.roadService.findLaneCoord( pointerEventData.point );

		if ( coord ) {

			this.debugService.onSelected( coord );

		} else {

			this.debugService.resetHighlighted();

		}

	}

	onPointerMoved ( e: PointerMoveData ): void {

		this.debugService.resetHighlighted();

		const coord = this.tool.roadService.findLaneCoord( e.point );

		if ( !coord ) {

			if ( this.toolTip ) {
				this.tool.toolTipService.removeToolTip( this.toolTip );
				this.toolTip = null;
			}

			return;
		}

		this.debugService.onHighlight( coord );

		// TODO: make the offset dynamic as per the tool bar position
		const offset = new Vector2( 12, 180 );

		if ( this.toolTip ) {

			const contents = this.getContents( coord );

			this.tool.toolTipService.updateTooltipContent( this.toolTip.id, contents );
			this.tool.toolTipService.updateTooltipPosition( this.toolTip.id, offset );

		} else {

			const contents = this.getContents( coord );

			this.toolTip = this.tool.toolTipService.createFrom3D( contents, offset );

		}

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

	}

	private getContents ( coord: TvLaneCoord ): string {

		let contents = '';

		contents += `Lane: ${ coord.lane.id }<br/>`;
		contents += `Road: ${ coord.road.id }<br/>`;
		contents += `LaneSection: ${ coord.laneSection.s }<br/>`;

		if ( coord.road.successor ) {
			contents += 'Successor:' + coord.road.successor?.toString() + '</br>';
		}

		if ( coord.road.predecessor ) {
			contents += 'Predecessor:' + coord.road.predecessor?.toString() + '</br>';
		}

		contents += '<br/>Successors Lanes:<br/>';
		const successors = JunctionUtils.findSuccessors( coord.road, coord.lane, coord.road.successor );
		successors.forEach( lane => {
			contents += `Successor: ${ lane.id }<br/>`;
		} );

		contents += '<br/>Predecessors Lanes:<br/>';
		const predecessors = JunctionUtils.findPredecessors( coord.road, coord.lane, coord.road.predecessor );

		predecessors.forEach( lane => {
			contents += `Predecessor: ${ lane.id }<br/>`;
		} );

		return contents;
	}
}
