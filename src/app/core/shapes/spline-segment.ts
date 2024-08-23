/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export enum SplineSegmentType {
	ROAD = 'road',
	JUNCTION = 'junction',
	NONE = 'none'
}


/**
 * @deprecated
 */
export class SplineSegment {

	static stringToType ( type: string ): SplineSegmentType {
		switch ( type ) {
			case SplineSegmentType.ROAD:
				return SplineSegmentType.ROAD;
			case SplineSegmentType.JUNCTION:
				return SplineSegmentType.JUNCTION;
			default:
				return SplineSegmentType.NONE;
		}
	}
}
