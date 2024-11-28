/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneDistance, RoadDistance } from "app/map/road/road-distance";

export interface HasDistanceValue {
	s: number | RoadDistance | LaneDistance;
}
