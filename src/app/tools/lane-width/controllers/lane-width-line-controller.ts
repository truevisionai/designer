/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { LineController } from "../../../core/object-handlers/line-controller";
import { LaneWidthService } from "../lane-width.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { RoadGeometryService } from "../../../services/road/road-geometry.service";
import { Commands } from "app/commands/commands";
import { LaneWidthLine } from "../objects/lane-width-line";
import { LaneWidthInspector } from "../lane-width-node-inspector";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthLineController extends LineController<LaneWidthLine> {


	constructor ( private laneWidthService: LaneWidthService ) {
		super()
	}

	showInspector ( object: LaneWidthLine ): void {

		this.setInspector( new LaneWidthInspector( object ) );

	}

	onAdded ( line: LaneWidthLine ): void {

		this.laneWidthService.addLaneWidth( line.laneSection, line.lane, line.width );

	}

	validate ( object: LaneWidthLine ): void {

		this.laneWidthService.validateLaneWidth( object.road, object.laneSection, object.lane, object.width );

	}

	onUpdated ( line: LaneWidthLine ): void {

		this.laneWidthService.updateLaneWidth( line.laneSection, line.lane, line.width );

	}

	onRemoved ( line: LaneWidthLine ): void {

		this.laneWidthService.removeLaneWidth( line.laneSection, line.lane, line.width );

	}

	private initialSValue: number;

	onDrag ( line: LaneWidthLine, e: PointerEventData ): void {

		this.initialSValue = this.initialSValue || line.s;

		const coord = RoadGeometryService.instance.findRoadCoordAt( line.road, e.point );

		const sOffset = coord.s - line.laneSection.s;

		line.s = sOffset;

		this.laneWidthService.updateCoefficients( line.lane );

	}

	getDragTip ( object: LaneWidthLine ): string | null {

		return `Distance: ${ object.s.toFixed( 2 ) }`;

	}

	onDragEnd ( line: LaneWidthLine, e: PointerEventData ): void {

		const coord = RoadGeometryService.instance.findRoadCoordAt( line.road, e.point );

		const sOffset = coord.s - line.laneSection.s;

		Commands.SetValue( line, 's', sOffset, this.initialSValue );

		this.initialSValue = null;

	}

}
