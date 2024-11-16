/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Orientation } from 'app/scenario/models/tv-orientation';
import { Vector3 } from 'three';
import { TvRoad } from './tv-road.model';
import { TvContactPoint } from './tv-common';
import { Maths } from 'app/utils/maths';
import { TvLaneCoord } from './tv-lane-coord';
import { TvLane } from './tv-lane';
import { RoadGeometryService } from 'app/services/road/road-geometry.service';
import { TvPosTheta } from './tv-pos-theta';
import { Log } from 'app/core/utils/log';
import { createLaneDistance } from '../road/road-distance';

export class TvRoadCoord {

	public readonly road: TvRoad;
	public readonly s: number;
	public readonly t: number;
	public readonly z: number;
	public readonly h: number;
	public readonly p: number;
	public readonly r: number;
	public readonly posTheta: TvPosTheta;

	constructor ( road: TvRoad, s: number, t: number = 0, z: number = 0, h?: number, p?: number, r?: number ) {

		this.road = road;
		this.s = s;
		this.t = t;
		this.z = z;
		this.h = h ?? 0;
		this.p = p ?? 0;
		this.r = r ?? 0;

		this.posTheta = road.getRoadPosition( this.s, this.t );

	}

	get contact (): TvContactPoint {

		if ( Maths.approxEquals( this.s, 0, 1 ) ) return TvContactPoint.START;

		if ( Maths.approxEquals( this.s, this.road.length, 1 ) ) return TvContactPoint.END;

		Log.error( `TvRoadCoord.contactCheck: Invalid contact point ${ this.s }` );

		return this.getNearestContact( this.road );

	}

	get laneSection () {
		return this.road.getLaneProfile().getLaneSectionAtContact( this.contact );
	}

	get lanes () {
		return this.laneSection.getLanes();
	}

	get roadId (): number {
		return this.road.id;
	}

	get position (): Vector3 {
		return this.posTheta.position;
	}

	get orientation (): Orientation {

		let h = this.h;

		if ( this.t > 0 ) h += Math.PI;

		return new Orientation( h, this.p, this.r );
	}

	toPosTheta (): TvPosTheta {
		return this.posTheta;
	}

	toLaneCoord ( lane: TvLane ): TvLaneCoord {

		const laneDistance = createLaneDistance( lane, this.s - this.laneSection.s );

		return new TvLaneCoord( this.road, this.laneSection, lane, laneDistance, this.t );

	}

	getNearestContact ( road: TvRoad ): TvContactPoint {
		return RoadGeometryService.instance.findNearestContactPoint( road, this.position );
	}

	toString (): string {
		return `Road:${ this.road.id }, S:${ this.s }, T:${ this.t }`;
	}
}
