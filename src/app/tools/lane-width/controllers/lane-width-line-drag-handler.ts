/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Commands } from "app/commands/commands";
import { BaseDragHandler } from "app/core/drag-handlers/base-drag-handler";
import { PointerEventData } from "app/events/pointer-event-data";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { LaneWidthService } from "../lane-width.service";
import { LaneWidthLine } from "../objects/lane-width-line";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthLineDragHandler extends BaseDragHandler<LaneWidthLine> {

	private initialSValue: number;

	constructor ( private laneWidthService: LaneWidthService ) {
		super();
	}

	onDragStart ( object: LaneWidthLine, e: PointerEventData ): void {
		// throw new Error( "Method not implemented." );
	}

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
