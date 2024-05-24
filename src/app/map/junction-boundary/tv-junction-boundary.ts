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
}

export interface TvJunctionSegmentBoundary {
	type: TvBoundarySegmentType;
}

// roadId="2" contactPoint="end" jointLaneStart="2" jointLaneEnd="-1"
// using for incoming/outgoing roads
// goes from left to right of the road
export class TvJointBoundary implements TvJunctionSegmentBoundary {
	type: TvBoundarySegmentType = TvBoundarySegmentType.JOINT;
	road: TvRoad;
	transitionLength: number;
	contactPoint: TvContactPoint;
	jointLaneStart: TvLane;
	jointLaneEnd: TvLane;
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
}
