import { Vector3 } from 'three';
import { Position } from '../models/position';
import { PositionType } from '../models/tv-enums';
import { Orientation } from '../models/tv-orientation';

export class RelativeRoadPosition extends Position {

	readonly label: string = 'RelativeRoadPosition';
	readonly type: PositionType = PositionType.RelativeRoad;

	constructor ( public entity: string, public roadId: number, public ds: number, public dt: number, public orientation: Orientation ) {
		super();
	}

	toVector3 (): Vector3 {
		throw new Error( 'Method not implemented.' );
	}

}
