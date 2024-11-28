import { AbstractSpline } from "../../../core/shapes/abstract-spline";
import { TvJunctionType } from "./tv-junction-type";
import { SplineIntersection } from "../../../services/junction/spline-intersection";
import { SplineSection } from "../../../services/junction/spline-section";
import { TvJunction } from "./tv-junction";

export class AutoJunction extends TvJunction {

	private splines = new Set<AbstractSpline>();

	constructor ( name: string, id: number ) {
		super( name, id );
		this.type = TvJunctionType.AUTO;
	}

	override getSplineIntersections (): SplineIntersection[] {

		const intersections: SplineIntersection[] = [];
		const splines = this.getIncomingSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			// Start the inner loop from the next spline to avoid duplicate pairs and self-comparison.
			for ( let j = i + 1; j < splines.length; j++ ) {

				const otherSpline = splines[ j ];

				intersections.push( ...spline.getIntersections( otherSpline ) );

			}

		}

		return intersections;
	}

	override getIncomingSplines (): AbstractSpline[] {

		super.getIncomingSplines().forEach( spline => this.splines.add( spline ) );

		return [ ...this.splines ];

	}

	addSpline ( spline: AbstractSpline | AbstractSpline[] ): void {

		const splines = Array.isArray( spline ) ? spline : [ spline ];

		splines.forEach( s => this.splines.add( s ) );

	}

	removeSpline ( spline: AbstractSpline | AbstractSpline[] ): void {

		const splines = Array.isArray( spline ) ? spline : [ spline ];

		splines.forEach( s => this.splines.delete( s ) );

	}

	updateFromIntersections (): void {

		// this.getSplineSections().forEach( section => {
		//
		// 	section.shiftJunctionAndUpdateSegments( this );
		//
		// } );

	}

	getSplineSections (): SplineSection[] {

		return this.getSplineIntersections().map( intersection => intersection.getSplineSections() ).flat();

	}

}
