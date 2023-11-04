import { Orientation } from 'app/modules/scenario/models/tv-orientation';
import { Vector3 } from 'three';
import { TvRoad } from './tv-road.model';


export class TvRoadCoord {

	constructor ( public road: TvRoad, public s: number, public t: number = 0, public z: number = 0, public h?, public p?, public r?) {
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

	init () {
	}

	add ( value: TvRoadCoord ) {
	}

	toPosTheta () {
		return this.road?.getRoadCoordAt( this.s, this.t );
	}
}
