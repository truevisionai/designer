/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'app/core/maths';
import { TvRoad } from './tv-road.model';
import { TvLaneSection } from "./tv-lane-section";
import { TvLane } from "./tv-lane";
import { TvContactPoint, TvLaneType } from './tv-common';
import { Maths } from 'app/utils/maths';
import { Orientation } from 'app/scenario/models/tv-orientation';
import { LaneUtils } from "../../utils/lane.utils";
import { TvLink } from './tv-link';
import { LaneDistance, RoadDistance } from '../road/road-distance';
import { TvPosTheta } from './tv-pos-theta';
import { TvLaneRoadMark } from './tv-lane-road-mark';
import { TvLaneHeight } from '../lane-height/lane-height.model';

export class TvLaneCoord {

	constructor (
		public readonly road: TvRoad,
		public readonly laneSection: TvLaneSection,
		public readonly lane: TvLane,
		public readonly laneDistance: LaneDistance,
		public readonly offset: number = 0
	) {
	}

	get s () {
		return this.laneDistance;
	}

	get roadDistance (): RoadDistance {
		return this.laneSection.s + this.laneDistance as RoadDistance;
	}

	toString (): string {
		return `LaneCoord: Road:${ this.road.id } Section:${ this.laneSection.id } Lane:${ this.lane.id } s:${ this.laneDistance } offset:${ this.offset }`;
	}

	getLink (): TvLink {
		return this.road.getLink( this.contact );
	}

	get contact (): TvContactPoint {

		if ( Maths.approxEquals( this.laneSection.s - this.laneDistance, 0 ) ) return TvContactPoint.START;

		if ( Maths.approxEquals( this.laneSection.s + this.laneDistance, this.road.length ) ) return TvContactPoint.END;

		console.error( `TvRoadCoord.contact: s is not 0 or length ${ this.laneDistance } ${ this.road.length }` );
	}

	get isStart (): boolean {
		return this.contact === TvContactPoint.START;
	}

	get isEnd (): boolean {
		return this.contact === TvContactPoint.END;
	}

	get posTheta () {
		return this.road.getLaneStartPosition( this.lane, this.laneSection.s + this.laneDistance as RoadDistance, this.offset );
	}

	get position (): Vector3 {
		return this.posTheta.toVector3();
	}

	get direction (): Vector3 {
		return this.posTheta.toDirectionVector();
	}

	get laneDirection (): Vector3 {
		if ( LaneUtils.inRoadDirection( this.road, this.lane ) ) {
			return this.direction;
		} else {
			return this.direction.negate();
		}
	}

	get orientation (): Orientation {
		// let h = this.h;
		// if ( this.t > 0 ) h += Math.PI;
		// return new Orientation( h, this.p, this.r );
		return new Orientation( 0, 0, 0 );
	}

	distanceTo ( exit: TvLaneCoord ): number {
		return this.position.distanceTo( exit.position );
	}

	canConnect ( otherLane: TvLaneCoord ): boolean {

		if ( this.road.id === otherLane.road.id ) return false;

		if ( this.lane.type !== otherLane.lane.type ) return false;

		// for carriage way we don't want to merge entries with entries and exits with exits
		if ( this.lane.isCarriageWay() && this.lane.type != TvLaneType.shoulder ) {

			// don't merge if both are entries
			if ( this.isEntry() && otherLane.isEntry() ) return false;

			// don't merge if both are exits
			if ( this.isExit() && otherLane.isExit() ) return false;

		}

		return true;

	}

	isEntry (): boolean {
		return this.lane.isEntry( this.contact );
	}

	isExit (): boolean {
		return this.lane.isExit( this.contact );
	}

	getLaneWidth (): number {
		return this.lane.getWidthValue( this.laneDistance );
	}

	getLaneHeight (): TvLaneHeight {
		return this.lane.getHeightValue( this.laneDistance );
	}

	getLaneDirectionVector (): Vector3 {
		if ( this.lane.isLeft || this.lane.isBackward ) {
			return this.posTheta.reverseHeading().toDirectionVector();
		}
		return this.posTheta.toDirectionVector();
	}

	getLaneHeading (): number {
		if ( this.lane.isBackward ) {
			return this.posTheta.hdg + Math.PI;
		}
		return this.posTheta.hdg;
	}

	getHeading (): number {
		return this.posTheta.hdg;
	}

	getHeadingVector (): Vector3 {
		return this.posTheta.toDirectionVector();
	}

	getRoadMark (): TvLaneRoadMark {
		return this.lane.getRoadMarkAt( this.laneDistance );
	}

	getEntryPosition (): TvPosTheta {
		if ( this.lane.isRight ) {
			if ( this.contact == TvContactPoint.START ) {
				return this.road.getLaneEndPosition( this.lane, this.roadDistance );
			} else {
				return this.road.getLaneStartPosition( this.lane, this.roadDistance );
			}
		} else {
			if ( this.contact == TvContactPoint.START ) {
				return this.road.getLaneStartPosition( this.lane, this.roadDistance );
			} else {
				return this.road.getLaneEndPosition( this.lane, this.roadDistance );
			}
		}
	}

	getExitPosition (): TvPosTheta {
		if ( this.lane.isRight ) {
			if ( this.contact == TvContactPoint.START ) {
				return this.road.getLaneStartPosition( this.lane, this.roadDistance );
			} else {
				return this.road.getLaneEndPosition( this.lane, this.roadDistance );
			}
		} else {
			if ( this.contact == TvContactPoint.START ) {
				return this.road.getLaneEndPosition( this.lane, this.roadDistance );
			} else {
				return this.road.getLaneStartPosition( this.lane, this.roadDistance );
			}
		}
	}

}

