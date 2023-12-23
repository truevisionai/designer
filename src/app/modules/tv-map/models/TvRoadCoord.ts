import { Orientation } from 'app/modules/scenario/models/tv-orientation';
import { Vector3 } from 'three';
import { TvRoad } from './tv-road.model';
import { TvContactPoint } from './tv-common';
import { Maths } from 'app/utils/maths';
import { TvLaneCoord } from './tv-lane-coord';
import { TvLane } from './tv-lane';

export class TvRoadCoord {

	constructor ( public road: TvRoad, public s: number, public t: number = 0, public z: number = 0, public h?, public p?, public r?) {
	}

	get contact (): TvContactPoint {

		if ( Maths.approxEquals( this.s, 0 ) ) return TvContactPoint.START;

		if ( Maths.approxEquals( this.s, this.road.length ) ) return TvContactPoint.END;

		throw new Error( `TvRoadCoord.contact: s is not 0 or length ${ this.s } ${ this.road.length }` );
	}

	get laneSection () {

		if ( this.contact == TvContactPoint.START ) {

			return this.road.getFirstLaneSection();

		} else if ( this.contact == TvContactPoint.END ) {

			return this.road.getLastLaneSection();

		} else {

			throw new Error( `TvRoadCoord.laneSection: Invalid contact point ${ this.contact }` );
		}

	}

	get roadId (): number {

		return this.road.id;

	}

	get position (): Vector3 {

		return this.toPosTheta().toVector3();

	}

	get orientation (): Orientation {

		let h = this.h;

		if ( this.t > 0 ) h += Math.PI;

		return new Orientation( h, this.p, this.r );
	}

	init () { }

	add ( value: TvRoadCoord ) { }

	toPosTheta () {
		return this.road?.getRoadCoordAt( this.s, this.t );
	}

	toLaneCoord ( lane: TvLane ) {
		return new TvLaneCoord( this.road, this.laneSection, lane, this.s, this.t );
	}

	getNearestContact ( road: TvRoad ): TvContactPoint {

		const startDistance = road.getPositionAt( 0 ).position.distanceTo( this.position );
		const endDistance = road.getPositionAt( road.length ).position.distanceTo( this.position );

		if ( startDistance < endDistance ) {

			return TvContactPoint.START;

		} else {

			return TvContactPoint.END

		}

	}

	getContactPosition ( road: TvRoad ): number {

		const startDistance = road.getPositionAt( 0 ).position.distanceTo( this.position );
		const endDistance = road.getPositionAt( road.length ).position.distanceTo( this.position );

		if ( startDistance < endDistance ) {

			return 0;

		} else {

			return road.length;;

		}

	}
}
