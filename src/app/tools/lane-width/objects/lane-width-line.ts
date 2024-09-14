/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DebugLine } from "../../../objects/debug-line";
import { TvLaneWidth } from "../../../map/models/tv-lane-width";
import { TvRoad } from "../../../map/models/tv-road.model";
import { TvLaneSection } from "../../../map/models/tv-lane-section";
import { TvLane } from "../../../map/models/tv-lane";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";

export class LaneWidthLine extends DebugLine<TvLaneWidth> {

	public static readonly tag = 'width-line';

	tag = LaneWidthLine.tag;

	constructor (
		public road: TvRoad,
		public laneSection: TvLaneSection,
		public lane: TvLane,
		public width: TvLaneWidth,
		public geometry: LineGeometry,
		public material: LineMaterial
	) {
		super( width, geometry, material );
	}

	get s (): number {
		return this.width.s;
	}

	set s ( value: number ) {
		this.width.s = value;
	}

	static createLine ( laneCoord: TvLaneCoord, laneWidth: TvLaneWidth ): LaneWidthLine {

		const road = laneCoord.road;

		const laneSection = laneCoord.laneSection;

		const lane = laneCoord.lane;

		const start = RoadGeometryService.instance.findLaneStartPosition( road, laneSection, lane, laneWidth.s );

		const end = RoadGeometryService.instance.findLaneEndPosition( road, laneSection, lane, laneWidth.s );

		const points = [ start.position, end.position ];

		const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

		const material = this.getMaterial();

		return new LaneWidthLine( road, laneSection, lane, laneWidth, geometry, material );

	}

}
