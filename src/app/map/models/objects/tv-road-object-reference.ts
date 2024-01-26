/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneValidity } from "./tv-lane-validity";

export class TvRoadObjectReference {

	public attr_s;
	public attr_t;
	public attr_id;
	public attr_zOffset;
	public attr_validLength;
	public attr_orientation;

	public validity: TvLaneValidity[] = [];
}
