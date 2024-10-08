/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { AutoJunction, TvJunction } from "app/map/models/junctions/tv-junction";
import { TvLink } from "app/map/models/tv-link";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { SplineSection } from 'app/services/junction/spline-section';

import { GeometryUtils } from "app/services/surface/geometry-utils";
import { Assert } from "app/utils/assert";
import { Box2, Vector2, Vector3 } from "three";

export class IntersectionGroup {

	private intersections = new Map<string, SplineIntersection>();

	private splines: Set<AbstractSpline> = new Set();

	public centroid: Vector3;

	public area: Box2;

	constructor ( i: SplineIntersection ) {

		this.area = new Box2();

		this.addSplineIntersection( i );

	}

	getIntersectionCount (): number {

		return this.intersections.size;

	}

	getJunctions (): TvJunction[] {

		const junctions = this.getJunctionsViaSplines();

		Assert.isLessThanOrEqual( junctions.length, 1, 'More than one junction found in group' );

		return Array.from( junctions );

	}

	getJunctionLinks ( junction: TvJunction, sort = true ): TvLink[] {

		const links: TvLink[] = [];

		this.getSplineSections().forEach( section => {

			links.push( ...section.spline.getSegmentLinks( junction ) );

		} );

		if ( sort ) {
			return GeometryUtils.sortRoadLinks( links );
		}

		return links;
	}

	private getJunctionsViaSplines (): TvJunction[] {

		const junctions = new Set<TvJunction>();

		this.getJunctionSegments().forEach( junction => {

			const center = this.getRepresentativePosition();

			const groupPosition = new Vector2( center.x, center.y );

			const isNearGroup = junction.distanceToPoint( groupPosition ) < 10;

			const isInsideBoundingBox = junction.boundingBox.containsPoint( groupPosition );

			if ( isNearGroup || isInsideBoundingBox ) {

				junctions.add( junction );

			}

		} );

		// // Another way to get junctions

		// const junctions = new Set<TvJunction>();

		// this.intersections.forEach( intersection => {

		// 	if ( intersection.isNearJunction() ) {

		// 		const junction = intersection.getJunction();

		// 		if ( junction ) {

		// 			junctions.add( junction );

		// 		} else {

		// 			Log.error( 'Junction not found for intersection', intersection );

		// 		}

		// 	}

		// } );

		return Array.from( junctions );

	}

	private getJunctionSegments (): TvJunction[] {

		const junctions = [];

		this.splines.forEach( spline => {

			spline.getJunctionSegments().forEach( junction => {

				junctions.push( junction );

			} );

		} );

		return Array.from( junctions );

	}

	addSplineIntersection ( data: SplineIntersection | SplineIntersection[] ): void {

		const intersections = Array.isArray( data ) ? data : [ data ];

		for ( const intersection of intersections ) {

			this.intersections.set( intersection.getKey(), intersection );

			this.splines.add( intersection.spline );
			this.splines.add( intersection.otherSpline );

			// Expand the group area to include the new intersection area
			this.area.expandByPoint( intersection.area.min );
			this.area.expandByPoint( intersection.area.max );

		}

	}

	hasSplineIntersection ( intersection: SplineIntersection ): boolean {

		return this.intersections.has( intersection.getKey() );

	}

	/**
	 * Calculates the centroid of the intersections as the representative position
	 * @returns Vector3
	 */
	getRepresentativePosition (): Vector3 {

		if ( this.centroid ) return this.centroid;

		let x = 0, y = 0, z = 0;

		this.intersections.forEach( intersection => {

			x += intersection.position.x;

			y += intersection.position.y;

			z += intersection.position.z;

		} );

		const count = this.intersections.size;

		return new Vector3( x / count, y / count, z / count );
	}

	getSplines (): AbstractSpline[] {

		return Array.from( this.splines );

	}

	getSplineCount (): number {

		return this.splines.size;

	}

	getIntersections (): SplineIntersection[] {

		return Array.from( this.intersections.values() );

	}

	hasIntersection ( intersection: SplineIntersection ): boolean {

		return this.intersections.has( intersection.getKey() );

	}

	hasSpline ( spline: AbstractSpline ): boolean {

		return this.splines.has( spline );

	}

	getOffset ( spline: AbstractSpline ) {

		const sections = this.getSplineSections().filter( section => section.spline.equals( spline ) );

		const startValues = sections.map( section => section.getStart() );
		const endValues = sections.map( section => section.getEnd() );

		const sStart = Math.min( ...startValues );
		const sEnd = Math.max( ...endValues );

		return { sStart, sEnd };

	}

	getSplineSections (): SplineSection[] {

		const sections = [];

		this.intersections.forEach( intersection => {

			sections.push( ...intersection.getSplineSections() );

		} );

		return sections

	}

	merge ( otherGroup: IntersectionGroup ) {

		otherGroup.intersections.forEach( intersection => {

			this.addSplineIntersection( intersection );

		} );

	}

	updateSectionOffsets (): void {

		for ( const section of this.getSplineSections() ) {

			section.updateOffsets( this.area );

		}

	}

	getKey (): string {

		return Array.from( this.splines ).map( spline => spline.uuid ).sort().join( '_' );

	}

	matchesJunction ( junction: TvJunction ): boolean {

		return junction.getKey() == this.getKey();

	}

	expandByJunction ( junction: AutoJunction ): void {

		const boundingBox = junction.getBoundingBox();

		this.area.expandByPoint( boundingBox.min );

		this.area.expandByPoint( boundingBox.max );

	}

	toString () {

		const splines = Array.from( this.splines ).map( spline => spline.id ).join( ',' );

		return `IntersectionGroup: ${ this.intersections.size } Splines:${ splines } Center:${ this.centroid.x.toFixed( 2 ) },${ this.centroid.y.toFixed( 2 ) }`;

	}

	reComputeJunctionOffsets ( force = false ) {

		if ( !force && this.getSplines().length < 2 ) return;

		// if group has more than 2 spline we should recalculate junctions regions
		// for each of them to update their start/end positions
		const splines = this.getSplines();

		for ( let a = 0; a < splines.length; a++ ) {

			const spline = splines[ a ];

			for ( let b = a + 1; b < splines.length; b++ ) {

				const element = splines[ b ];

				const intersections = spline.getIntersections( element );

				intersections.forEach( i => this.addSplineIntersection( i ) );

			}

		}

		// group.getSplines().forEach( spline => {

		// const offset = group.getOffset( spline );

		// this.createRoadCoordNew( spline, offset.sStart, offset.sEnd, junction, group ).forEach( c => coords.push( c ) );

		// this.splineBuilder.buildGeometry( spline );

		// } );

		// DebugDrawService.instance.drawBox2D( group.area, COLOR.WHITE );

	}
}
