import { AbstractPosition } from '../osc-interfaces';
import { OscPositionType } from '../osc-enums';
import { OscOrientation } from '../osc-orientation';
import { Vector3 } from 'three';

export class OscRelativeWorldPosition extends AbstractPosition {

	public readonly type = OscPositionType.RelativeWorld;

	private object: string;
	private dx: number;
	private dy: number;
	private dz: number;
	private orientation: OscOrientation;

	exportXml () {

		throw new Error( 'Method not implemented.' );

	}

	getPosition (): Vector3 {

		console.error( 'Method not implemented.' );

		return new Vector3();

	}


}
