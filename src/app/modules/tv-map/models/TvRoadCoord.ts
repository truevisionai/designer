import { Orientation } from 'app/modules/scenario/models/tv-orientation';
import { Vector3 } from 'three';
// import { TvMapInstance } from '../services/tv-map-instance';
import { TvRoad } from './tv-road.model';


export class TvRoadCoord {

	constructor ( public roadId, public s: number, public t: number = 0, public z: number = 0, public h?, public p?, public r?) {
	}

	get road (): TvRoad {
		throw new Error( 'method not implemented' );
		// return TvMapInstance.map.getRoadById( this.roadId );
	}

	get position (): Vector3 {
		return this.toPosTheta().toVector3();
	}

	get orientation (): Orientation {

		let h = this.h;

		if ( this.t > 0 ) h += Math.PI;

		return new Orientation( h, this.p, this.r );
	}

	init () {
	}

	add ( value: TvRoadCoord ) {
	}

	toPosTheta () {
		return this.road?.getRoadCoordAt( this.s, this.t );
	}
}
