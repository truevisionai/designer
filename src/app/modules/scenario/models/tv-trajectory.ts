/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractPosition } from './abstract-position';
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
		public position?: AbstractPosition,
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
}

export class SplineShape extends AbstractShape {
	public controlPoint1: ControlPoint;
	public controlPoint2: ControlPoint;
}

export class ControlPoint {
	constructor ( public status?: string ) {
	}
}



