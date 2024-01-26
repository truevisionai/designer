/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// The tunnel record is – like an object record – applied to the entire cross
// section of the road within the given range unless a lane validity record with
// further restrictions is provided as child record
import { TvTunnelTypes } from "../tv-common";
import { TvLaneValidity } from "./tv-lane-validity";

export class TvRoadTunnel {

	public attr_s: number;
	public attr_length: number;
	public attr_name: string;
	public attr_id: string;
	public attr_type: TvTunnelTypes;

	// degree of artificial tunnel lighting
	public attr_lighting: number;

	// degree of daylight intruding the tunnel
	public attr_daylight: number;

	public validity: TvLaneValidity[] = [];

}
