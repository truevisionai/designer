/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { Box2, Vector3 } from "three";
import { SplineSection, SplineSectionFactory } from './spline-section';


export class SplineIntersection {

	public area: Box2;

	private sections: Map<AbstractSpline, SplineSection> = new Map();

	constructor (
		public spline: AbstractSpline,
		public otherSpline: AbstractSpline,
		public position: Vector3,
	) {
	}

	// get splineStart (): number {
	// 	return this.sections.get( this.spline ).getStart();
	// }

	// set splineStart ( value: number ) {
	// 	this.sections.get( this.spline ).setStart( value );
	// }

	// get splineEnd (): number {
	// 	return this.sections.get( this.spline ).getEnd();
	// }

	// set splineEnd ( value: number ) {
	// 	this.sections.get( this.spline ).setEnd( value );
	// }

	// get otherStart (): number {
	// 	return this.sections.get( this.otherSpline ).getStart();
	// }

	// set otherStart ( value: number ) {
	// 	this.sections.get( this.otherSpline ).setStart( value );
	// }

	// get otherEnd (): number {
	// 	return this.sections.get( this.otherSpline ).getEnd();
	// }

	// set otherEnd ( value: number ) {
	// 	this.sections.get( this.otherSpline ).setEnd( value );
	// }

	getPosition (): Vector3 {
		return this.position;
	}

	addSection ( spline: AbstractSpline, start: number, end: number ): void {
		this.sections.set( spline, SplineSectionFactory.create( spline, start, end ) );
	}

	getSplineSections (): SplineSection[] {
		return Array.from( this.sections.values() );
	}

	getKey (): string {
		return this.getSplines().map( s => s.uuid ).sort().join( '_' );
	}

	getSplines (): AbstractSpline[] {
		return [ this.spline, this.otherSpline ];
	}

	isNearJunction (): boolean {
		return this.getSplineSections().some( section => section.isNearJunction() );
	}

	getJunction (): TvJunction | undefined {

		let junction: TvJunction;

		this.getSplineSections().forEach( section => {

			if ( section.isNearJunction() ) {

				if ( section.getStartSegment() instanceof TvJunction ) {

					junction = section.getStartSegment() as TvJunction;

				} else if ( section.getEndSegment() instanceof TvJunction ) {

					junction = section.getEndSegment() as TvJunction;

				}

			}

		} );

		return junction;

	}

}

