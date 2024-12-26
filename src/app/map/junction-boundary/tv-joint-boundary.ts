import { TvRoad } from "../models/tv-road.model";
import { TvContactPoint, TvLaneSide } from "../models/tv-common";
import { TvLane } from "../models/tv-lane";
import { TvPosTheta } from "../models/tv-pos-theta";
import { Log } from "../../core/utils/log";
import { TvBoundarySegmentType, TvJunctionSegmentBoundary } from "./tv-junction-boundary";
import { createRoadDistance, RoadDistance } from "../road/road-distance";

// roadId="2" contactPoint="end" jointLaneStart="2" jointLaneEnd="-1"
// using for incoming/outgoing roads
// goes from left to right of the road
export class TvJointBoundary implements TvJunctionSegmentBoundary {

	type: TvBoundarySegmentType = TvBoundarySegmentType.JOINT;

	/**
	 * The road that the joint boundary is on
	 */
	road: TvRoad;

	/**
	 * Contact point on the road
	 */
	contactPoint: TvContactPoint;

	/**
	 * the lane crossed by the segment. If missing all lanes are crossed by the segment.
	 */
	jointLaneStart?: TvLane;

	/**
	 * the lane crossed by the segment. If missing all lanes are crossed by the segment.
	 */
	jointLaneEnd?: TvLane;

	constructor ( road?: TvRoad, contactPoint?: TvContactPoint, jointLaneStart?: TvLane, jointLaneEnd?: TvLane ) {
		this.road = road;
		this.contactPoint = contactPoint;
		this.jointLaneStart = jointLaneStart;
		this.jointLaneEnd = jointLaneEnd
	}

	toString (): string {
		return `JointBoundary: roadId=${ this.road.id } contactPoint=${ this.contactPoint } jointLaneStart=${ this.jointLaneStart?.id } jointLaneEnd=${ this.jointLaneEnd?.id }`;
	}

	// eslint-disable-next-line max-lines-per-function
	getOuterPoints (): TvPosTheta[] {

		if ( this.road.geometries.length == 0 ) {
			Log.warn( 'Road has no geometries', this.road.toString() );
			return [];
		}

		if ( this.road.length == 0 ) {
			Log.warn( 'Road has no length', this.road.toString() );
			return [];
		}

		const roadDistance = createRoadDistance( this.road, this.contactPoint );
		const roadWidth = this.road.getRoadWidthAt( roadDistance );
		const lateralOffset = roadWidth.leftSideWidth - roadWidth.rightSideWidth;

		let start: TvPosTheta;

		if ( this.contactPoint == TvContactPoint.START ) {

			start = this.jointLaneStart.isRight ?
				this.road.getLaneEndPosition( this.jointLaneStart, roadDistance ) :
				this.road.getLaneStartPosition( this.jointLaneStart, roadDistance );

		} else if ( this.contactPoint == TvContactPoint.END ) {

			start = this.jointLaneStart.isRight ?
				this.road.getLaneStartPosition( this.jointLaneStart, roadDistance ) :
				this.road.getLaneEndPosition( this.jointLaneStart, roadDistance );

		}

		const mid = this.road.getPosThetaAt( roadDistance, lateralOffset * 0.5 );

		let end: TvPosTheta;

		if ( this.contactPoint == TvContactPoint.START ) {

			end = this.jointLaneEnd.isRight ?
				this.road.getLaneStartPosition( this.jointLaneEnd, roadDistance ) :
				this.road.getLaneEndPosition( this.jointLaneEnd, roadDistance );

		} else if ( this.contactPoint == TvContactPoint.END ) {

			end = this.jointLaneEnd.isRight ?
				this.road.getLaneEndPosition( this.jointLaneEnd, roadDistance ) :
				this.road.getLaneStartPosition( this.jointLaneEnd, roadDistance );

		}

		return [ start, mid, end ];
	}

	getInnerPoints (): TvPosTheta[] {
		return this.getOuterPoints();
	}

	clone (): TvJointBoundary {
		return new TvJointBoundary(
			this.road, this.contactPoint, this.jointLaneStart, this.jointLaneEnd
		);
	}
}
