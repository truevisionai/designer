/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Position } from './position';
import { ParameterDeclaration } from './tv-parameter-declaration';

export enum EnumTrajectoryDomain {
	Time = 'time',
	Distance = 'distance'
}

export class Trajectory {

	// min 2 vertices are mandatory
	public vertices: Vertex[] = [];
	public parameterDeclaration: ParameterDeclaration[] = [];

	constructor (
		public name: string,
		public closed: boolean,
		public domain: EnumTrajectoryDomain
	) {

	}
}

export class Vertex {

	constructor (
		public reference?: number,
		public position?: Position,
		public shape?: AbstractShape
	) {

	}

}

export abstract class AbstractShape {

}

export class PolylineShape extends AbstractShape {
}

export class ClothoidShape extends AbstractShape {
	public curvature: number;
	public curvatureDot: number;
	public length: number;

	toXML () {
		return {
			Clothoid: {
				attr_curvature: this.curvature,
				attr_curvatureDot: this.curvatureDot,
				attr_length: this.length
			}
		};
	}
}

export class SplineShape extends AbstractShape {
	public controlPoint1: ControlPoint;
	public controlPoint2: ControlPoint;
}

export class ControlPoint {
	constructor ( public status?: string ) {
	}
}



