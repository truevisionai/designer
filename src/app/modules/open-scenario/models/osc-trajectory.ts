import { AbstractPosition } from './osc-interfaces';
import { OscParameterDeclaration } from './osc-parameter-declaration';

export enum EnumTrajectoryDomain {
	Time = 'time',
	Distance = 'distance'
}

export class OscTrajectory {

	// min 2 vertices are mandatory
	public vertices: OscVertex[] = [];
	public parameterDeclaration: OscParameterDeclaration[] = [];

	constructor (
		public name: string,
		public closed: boolean,
		public domain: EnumTrajectoryDomain
	) {

	}
}

export class OscVertex {

	constructor (
		public reference?: number,
		public position?: AbstractPosition,
		public shape?: AbstractOscShape
	) {

	}

}

export abstract class AbstractOscShape {

}

export class OscPolylineShape extends AbstractOscShape {
}

export class OscClothoidShape extends AbstractOscShape {
	public curvature: number;
	public curvatureDot: number;
	public length: number;
}

export class OscSplineShape extends AbstractOscShape {
	public controlPoint1: OscControlPoint;
	public controlPoint2: OscControlPoint;
}

export class OscControlPoint {
	constructor ( public status?: string ) {
	}
}



