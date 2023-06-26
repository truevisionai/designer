/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from 'app/modules/tv-map/services/open-drive-parser.service';
import { Position } from './position';
import { ParameterDeclaration } from './tv-parameter-declaration';

export enum EnumTrajectoryDomain {
	Time = 'time',
	Distance = 'distance'
}

export class Trajectory {

	// min 2 vertices are mandatory
	public vertices: Vertex[] = [];
	public parameterDeclarations: ParameterDeclaration[] = [];

	constructor (
		public name: string,
		public closed: boolean,
		public domain: EnumTrajectoryDomain
	) {

	}

	addParameter ( parameterDeclaration: ParameterDeclaration ) {
		this.parameterDeclarations.push( parameterDeclaration );
	}

}

export class Vertex {

	constructor (
		public time?: number,
		public position?: Position,
		public shape?: AbstractShape
	) {

	}

}

export abstract class AbstractShape {

}

export class PolylineShape extends AbstractShape {
	vertices: Vertex[] = [];
	addVertex ( vertex: Vertex ) {
		this.vertices.push( vertex );
	}
}

export class ClothoidShape extends AbstractShape {

	/**
	 * Start curvature of clothoid. Unit: [1/m]. Range: ]-inf..inf[.
	 */
	public curvature: number;
	// @deprecated
	// Rate of change of the curvature of the clothoid. Unit: [1/s]. Range: [0..inf[.
	public curvatureDot: number;

	/**
	 * Length of clothoid. Unit: [m]. Range: ]0..inf[.
	 */
	public length: number;

	/**
	 * Rate of change of the curvature of the clothoid. Unit: [1/m²]. Range: ]-inf..inf[.
	 */
	public curvaturePrime: number;
	public startTime: number;
	public stopTime: number;
	/**
	 * Start position of a clothoid. If in the start position for an orientation dimension no value is provided, then a default of 0 is assumed.
	 */
	public position: Position;


	toXML () {

		return {
			attr_curvature: this.curvature,
			attr_curvatureDot: this.curvatureDot,
			attr_length: this.length,
			attr_curvaturePrime: this.curvaturePrime,
			attr_startTime: this.startTime,
			attr_stopTime: this.stopTime,
			Position: this.position.toXML()
		};


	}

	static fromXML ( xml: XmlElement ): ClothoidShape {

		const clothoid = new ClothoidShape();
		clothoid.curvature = parseFloat( xml.attr_curvature );
		clothoid.curvatureDot = parseFloat( xml.attr_curvatureDot );
		clothoid.length = parseFloat( xml.attr_length );
		clothoid.curvaturePrime = parseFloat( xml.attr_curvaturePrime );
		clothoid.startTime = parseFloat( xml.attr_startTime );
		clothoid.stopTime = parseFloat( xml.attr_stopTime );
		clothoid.position = Position.fromXML( xml.Position );

		return clothoid;

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



