/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { DebugLine } from "app/objects/debug-line";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

export class JunctionGateLine extends DebugLine<TvJunction> {

	static tag = 'junction-gate-line';

	public readonly junction: TvJunction;

	public readonly coord: TvLaneCoord;

	public tag: string = JunctionGateLine.tag;

	constructor ( junction: TvJunction, coord: TvLaneCoord, geometry: LineGeometry, material: LineMaterial ) {

		super( junction, geometry, material );

		this.junction = junction;

		this.coord = coord;

	}

}
