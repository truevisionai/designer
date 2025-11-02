/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline, NewSegment } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvLink } from "app/map/models/tv-link";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { SplineSection, SplineSectionFactory } from 'app/services/junction/spline-section';
import { GeometryUtils } from "app/services/surface/geometry-utils";
import { Assert } from "app/utils/assert";
import { Box2, Vector2, Vector3 } from "three";
import { AutoJunction } from "../map/models/junctions/auto-junction";

export class IntersectionGroup {

	private intersections = new Map<string, SplineIntersection>();

	private splines: Set<AbstractSpline> = new Set();

	public centroid: Vector3;

	public area: Box2;

	constructor ( i: SplineIntersection ) {

		this.area = new Box2();

		this.addSplineIntersection( i );

	}

	insertJunction ( junction: AutoJunction ): void {

		this.updateSectionOffsets();

		for ( const section of this.getUniqueSplineSections() ) {

			section.insertJunction( junction );

		}

		this.getSplines().forEach( spline => spline.updateSegmentGeometryAndBounds() );

	}

	updateJunction ( junction: AutoJunction ): void {

		this.updateSectionOffsets();

		for ( const section of this.getUniqueSplineSections() ) {

			section.updateJunction( junction );

		}

		this.ensureFirstSegmentIsAtStart();

		this.getSplines().forEach( spline => spline.updateSegmentGeometryAndBounds() );

	}

	private ensureFirstSegmentIsAtStart (): void {

		this.getSplines().forEach( spline => spline.shiftSegment( 0, spline.getFirstSegment() ) );

	}

	getIntersectionCount (): number {

		return this.intersections.size;

	}

	getJunctions (): TvJunction[] {

		const junctions = this.getJunctionsViaSplines();

		Assert.isLessThanOrEqual( junctions.length, 1, 'More than one junction found in group' );

		return junctions;

	}

	getJunctionLinks ( junction: TvJunction, sort: boolean = true ): TvLink[] {

		const links = new Map<NewSegment, TvLink>();

		this.updateSectionOffsets();

		const sections = this.getUniqueSplineSections();

		for ( const section of sections ) {

			section.getLinks( junction ).forEach( link => {

				links.set( link.element, link );

			} );

		}

		if ( sort ) {
			return GeometryUtils.sortRoadLinks( Array.from( links.values() ) );
		}

		return Array.from( links.values() );
	}

	private getJunctionsViaSplines (): TvJunction[] {

		const junctions = new Set<TvJunction>();

		const center = this.getRepresentativePosition();

		const groupPosition = new Vector2( center.x, center.y );

		this.getJunctionSegments().forEach( junction => {

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

		const junctions: TvJunction[] = [];

		this.splines.forEach( spline => {

			spline.getJunctionSegments().forEach( junction => {

				junctions.push( junction );

			} );

		} );

		return junctions

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

	getOffset ( spline: AbstractSpline ): any {

		this.updateSectionOffsets();

		const section = this.getUniqueSplineSections().find( section => section.spline.equals( spline ) );

		if ( section ) {

			const sStart = section.getStart();
			const sEnd = section.getEnd();

			return { sStart, sEnd };

		}

		return { sStart: 0, sEnd: 0 };

	}

	getSplineSections (): SplineSection[] {

		const sections = [];

		this.intersections.forEach( intersection => {

			sections.push( ...intersection.getSplineSections() );

		} );

		return sections

	}

	merge ( otherGroup: IntersectionGroup ): void {

		otherGroup.intersections.forEach( intersection => {

			this.addSplineIntersection( intersection );

		} );

	}

	updateSectionOffsets (): void {

		const extents = this.computeExtentsBySpline();

		for ( const section of this.getSplineSections() ) {

			const extent = extents.get( section.spline );

			if ( !extent ) continue;

			section.setOffsets( extent.start, extent.end );

			section.updateOffsetSegments();

		}

	}

	getKey (): string {

		return Array.from( this.splines ).map( spline => spline.uuid ).sort().join( '_' );

	}

	matchesJunction ( junction: TvJunction ): boolean {

		if ( !this.area.intersectsBox( junction.boundingBox ) ) return false;

		const junctionSplineIds = new Set( junction.getIncomingSplines().map( spline => spline.uuid ) );
		const groupSplineIds = new Set( this.getSplines().map( spline => spline.uuid ) );

		const allJunctionSplinesPresent = Array.from( junctionSplineIds ).every( id => groupSplineIds.has( id ) );

		return allJunctionSplinesPresent;

	}

	expandByJunction ( junction: AutoJunction ): void {

		const boundingBox = junction.getBoundingBox();

		this.area.expandByPoint( boundingBox.min );

		this.area.expandByPoint( boundingBox.max );

	}

	toString (): string {

		const splines = Array.from( this.splines ).map( spline => spline.id ).join( ',' );

		return `IntersectionGroup: ${ this.intersections.size } Splines:${ splines } Center:${ this.centroid.x.toFixed( 2 ) },${ this.centroid.y.toFixed( 2 ) }`;

	}

	reComputeJunctionOffsets ( force: boolean = false ): void {

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

	private getUniqueSplineSections (): SplineSection[] {

		const extents = this.computeExtentsBySpline();

		const sections: SplineSection[] = [];

		extents.forEach( ( extent, spline ) => {

			sections.push( SplineSectionFactory.create( spline, extent.start, extent.end ) );

		} );

		return sections;

	}

	private computeExtentsBySpline (): Map<AbstractSpline, { start: number; end: number }> {

		const extents = new Map<AbstractSpline, { start: number; end: number }>();

		for ( const section of this.getSplineSections() ) {

			const existing = extents.get( section.spline );

			if ( !existing ) {

				extents.set( section.spline, { start: section.getStart(), end: section.getEnd() } );

			} else {

				existing.start = Math.min( existing.start, section.getStart() );
				existing.end = Math.max( existing.end, section.getEnd() );

			}

		}

		return extents;

	}
}
