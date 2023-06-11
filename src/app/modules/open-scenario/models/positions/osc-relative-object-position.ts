import { AbstractPosition } from '../osc-interfaces';
import { OscPositionType } from '../osc-enums';
import { OscOrientation } from '../osc-orientation';
import { Vector3 } from 'three';
import { OscSourceFile } from '../../services/osc-source-file';

export class OscRelativeObjectPosition extends AbstractPosition {

	public readonly type = OscPositionType.RelativeObject;

	public dx: number = 0;

	public object: string;
	public dy: number = 0;
	public dz: number = 0;

	getPosition (): Vector3 {

		// TODO: Improve this and stop directly accessing oscSource
		const position = OscSourceFile.openScenario.objects.get( this.object ).gameObject.position;

		position.x += this.dx;
		position.y += this.dy;
		position.z += this.dz;

		return position;
	}

	public orientations: OscOrientation[] = [];


}
