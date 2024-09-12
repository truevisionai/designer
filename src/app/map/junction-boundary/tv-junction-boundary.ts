/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint } from "../models/tv-common";
import { TvLane } from "../models/tv-lane";
import { TvRoad } from "../models/tv-road.model";

export enum TvBoundarySegmentType {
	LANE,
	JOINT
};

export class TvJunctionBoundary {

	segments: TvJunctionSegmentBoundary[] = [];

	addSegment ( segment: TvJunctionSegmentBoundary ): void {
		this.segments.push( segment );
	}

	addSegments ( segments: TvJunctionSegmentBoundary[] ): void {
		segments.forEach( s => this.addSegment( s ) );
	}

	getSegments (): TvJunctionSegmentBoundary[] {
		return this.segments;
	}

	getSegmentCount (): number {
		return this.segments.length;
	}

	clearSegments (): void {
		this.segments = [];
	}

	clone () {
		const boundary = new TvJunctionBoundary();
		boundary.segments = this.segments.map( s => s.clone() );
		return boundary;
	}
}

export interface TvJunctionSegmentBoundary {
	type: TvBoundarySegmentType;

	clone (): TvJunctionSegmentBoundary;
}

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

	toString () {
		return `JointBoundary: roadId=${ this.road.id } contactPoint=${ this.contactPoint } jointLaneStart=${ this.jointLaneStart?.id } jointLaneEnd=${ this.jointLaneEnd?.id }`;
	}

	clone () {
		const joint = new TvJointBoundary();
		joint.road = this.road;
		joint.contactPoint = this.contactPoint;
		joint.jointLaneStart = this.jointLaneStart;
		joint.jointLaneEnd = this.jointLaneEnd;
		return joint;
	}
}

// roadId="8" boundaryLane="-2" sStart="begin" sEnd="end"
// ususally for connecting roads
// goes along the last/boundary lane of the connecting road
export class TvLaneBoundary implements TvJunctionSegmentBoundary {

	type: TvBoundarySegmentType = TvBoundarySegmentType.LANE;
	road: TvRoad;
	boundaryLane: TvLane;
	sStart: number | TvContactPoint;
	sEnd: number | TvContactPoint;

	constructor ( road?: TvRoad, boundaryLane?: TvLane, sStart?: number | TvContactPoint, sEnd?: number | TvContactPoint ) {
		this.road = road;
		this.boundaryLane = boundaryLane;
		this.sStart = sStart;
		this.sEnd = sEnd;
	}

	getRoad () {
		return this.road;
	}

	getLane () {
		return this.boundaryLane;
	}

	toString () {
		return `LaneBoundary: roadId=${ this.road.id } boundaryLane=${ this.boundaryLane.id } sStart=${ this.sStart } sEnd=${ this.sEnd }`;
	}

	clone () {
		const lane = new TvLaneBoundary();
		lane.road = this.road;
		lane.boundaryLane = this.boundaryLane;
		lane.sStart = this.sStart;
		lane.sEnd = this.sEnd;
		return lane;
	}
}
