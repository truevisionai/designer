/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from 'app/modules/tv-map/services/open-drive-parser.service';
import { Position } from './position';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { TvConsole } from 'app/core/utils/console';

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
		public domain: EnumTrajectoryDomain,
		public shape: AbstractShape
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

export class NurbControlPoint {
	constructor (
		public position: Position,
		public time: number,
		public weight: number,
	) {
	}
}

export class Knot {
	constructor ( public value: number ) {

	}
}

export class Nurbs extends AbstractShape {

	/**
	 *
	 * @param order Order of the NURBS trajectory. This is the order of the curve, not the degre
	 * e of the polynomials, which will be one less than the order of the curve. Range [2..inf[.
	 * @param controlPoints Control point vector of the NURBS trajectory. The number of control
	 * points must be greater or equal to the order of the curve.
	 * @param knots Knot vector of the NURBS trajectory. Knot values must be given in ascending order.
	 * The number of knot vector values must be equal to the number of control points plus the order of the curve.
	 */
	constructor (
		public order: number,
		public controlPoints: NurbControlPoint[] = [],
		public knots: Knot[] = [],
	) {
		super();
	}

	static fromXML ( xml: XmlElement ) {

		TvConsole.warn( 'Nurbs are not suppoerted yet' );

		const nurbs = new Nurbs( parseInt( xml.attr_order ) );

		xml.ControlPoint.forEach( ( cp: XmlElement ) => {
			nurbs.controlPoints.push( new NurbControlPoint(
				Position.fromXML( cp.Position ),
				parseFloat( cp.attr_time ),
				parseFloat( cp.attr_weight )
			) );
		} );

		xml.Knot.forEach( xml => {
			nurbs.knots.push( new Knot( parseFloat( xml.attr_value ) ) );
		} );

		return nurbs;
	}

	toXML () {
		return {
			attr_order: this.order,
			ControlPoint: this.controlPoints.map( cp => {
				return {
					attr_time: cp.time,
					attr_weight: cp.weight,
					Position: cp.position.toXML()
				};
			} ),
			Knot: this.knots.map( knot => {
				return {
					attr_value: knot.value
				};
			} )
		};
	}
}


