import { TvBridgeTypes } from "../tv-common";
import { TvLaneValidity } from "./tv-lane-validity";

export class TvRoadBridge {

	public attr_s: number;
	public attr_length: number;
	public attr_name: string;
	public attr_id: string;
	public attr_type: TvBridgeTypes;

	public validity: TvLaneValidity[] = [];
}
