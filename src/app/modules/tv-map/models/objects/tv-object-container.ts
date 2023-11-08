import { TvRoadObjectReference } from "./tv-road-object-reference";
import { TvRoadTunnel } from "./tv-road-tunnel";
import { TvRoadBridge } from "./tv-road-bridge";
import { TvRoadObject } from "./tv-road-object";

export class TvObjectContainer {
	public object: TvRoadObject[] = [];
	public objectReference: TvRoadObjectReference[] = [];
	public tunnel: TvRoadTunnel[] = [];
	public bridge: TvRoadBridge[] = [];
}
