/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvPosTheta } from "../models/tv-pos-theta";

export enum TvBoundarySegmentType {
	LANE,
	JOINT
};

export class TvJunctionBoundary {

	private segments: TvJunctionSegmentBoundary[] = [];

	constructor () { }

	addSegment ( segment: TvJunctionSegmentBoundary ): void {
		this.segments.push( segment );
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

	getPoints (): TvPosTheta[];

}
