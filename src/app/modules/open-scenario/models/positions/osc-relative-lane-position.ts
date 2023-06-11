import { Vector3 } from 'three';
import { OscPositionType } from '../osc-enums';
import { AbstractPosition } from '../osc-interfaces';
import { OscOrientation } from '../osc-orientation';

export class OscRelativeLanePosition extends AbstractPosition {

	public readonly type = OscPositionType.RelativeLane;

	public object: string;
	public dLane: number;
	public ds: number;
	public offset?: number;

	public orientations: OscOrientation[] = [];

	exportXml () {

		throw new Error( 'Method not implemented.' );

	}

	getPosition (): Vector3 {

		console.error( 'Method not implemented.' );

		return new Vector3();

	}


}
