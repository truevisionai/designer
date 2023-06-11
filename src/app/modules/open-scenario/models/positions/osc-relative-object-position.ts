/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { OscPositionType } from '../osc-enums';
import { AbstractPosition } from '../osc-interfaces';
import { OscOrientation } from '../osc-orientation';

export class OscRelativeObjectPosition extends AbstractPosition {

	public readonly type = OscPositionType.RelativeObject;

	public dx: number = 0;

	public object: string;
	public dy: number = 0;
	public dz: number = 0;
	public orientations: OscOrientation[] = [];

	toVector3 (): Vector3 {

		// TODO: Improve this and stop directly accessing oscSource
		const position = TvScenarioInstance.openScenario.objects.get( this.object ).gameObject.position;

		position.x += this.dx;
		position.y += this.dy;
		position.z += this.dz;

		return position;
	}


}
