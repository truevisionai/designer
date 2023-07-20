import { Vector3 } from 'three';
import { TvPosTheta } from '../../../modules/tv-map/models/tv-pos-theta';

export interface MoveStrategy {
	getPosTheta ( position: Vector3 ): TvPosTheta;

	getVector3 ( s: number ): Vector3;
}
