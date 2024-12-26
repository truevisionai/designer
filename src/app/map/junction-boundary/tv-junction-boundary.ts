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

	clone (): TvJunctionBoundary {
		const boundary = new TvJunctionBoundary();
		boundary.segments = this.segments.map( s => s.clone() );
		return boundary;
	}

	getOuterPositions (): TvPosTheta[] {

		const positions: TvPosTheta[] = [];

		this.getSegments().forEach( segment => {
			segment.getOuterPoints().forEach( point => {
				positions.push( point );
			} );
		} );

		return positions;
	}

	getInnerPositions (): TvPosTheta[] {

		const positions: TvPosTheta[] = [];

		this.getSegments().forEach( segment => {
			segment.getInnerPoints().forEach( point => {
				positions.push( point );
			} );
		} );

		return positions;
	}
}

export interface TvJunctionSegmentBoundary {

	type: TvBoundarySegmentType;

	clone (): TvJunctionSegmentBoundary;

	getOuterPoints (): TvPosTheta[];

	getInnerPoints (): TvPosTheta[];

}
