/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline, NewSegment } from 'app/core/shapes/abstract-spline';
import { MapEvents } from 'app/events/map-events';
import { RoadRemovedEvent } from 'app/events/road/road-removed-event';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Assert } from 'app/utils/assert';
import { Box2, Vector3 } from 'three';


export class SplineIntersection {

	public area: Box2;

	private sections: Map<AbstractSpline, SplineSection> = new Map();

	constructor (
		public spline: AbstractSpline,
		public otherSpline: AbstractSpline,
		public position: Vector3,
	) {
		this.addSection( spline, 0, 0 );
		this.addSection( otherSpline, 0, 0 );
	}

	get splineStart (): number {
		return this.sections.get( this.spline ).getStart();
	}

	set splineStart ( value: number ) {
		this.sections.get( this.spline ).setStart( value );
	}

	get splineEnd (): number {
		return this.sections.get( this.spline ).getEnd();
	}

	set splineEnd ( value: number ) {
		this.sections.get( this.spline ).setEnd( value );
	}

	get otherStart (): number {
		return this.sections.get( this.otherSpline ).getStart();
	}

	set otherStart ( value: number ) {
		this.sections.get( this.otherSpline ).setStart( value );
	}

	get otherEnd (): number {
		return this.sections.get( this.otherSpline ).getEnd();
	}

	set otherEnd ( value: number ) {
		this.sections.get( this.otherSpline ).setEnd( value );
	}

	getPosition (): Vector3 {
		return this.position;
	}

	addSection ( spline: AbstractSpline, start: number, end: number ): void {
		this.sections.set( spline, new SplineSection( spline, start, end ) );
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

export class SplineSection {

	private startSegment: NewSegment;
	private endSegment: NewSegment;

	constructor (
		public readonly spline: AbstractSpline,
		private start: number,
		private end: number
	) {
		this.startSegment = spline.getSegmentAt( start );
		this.endSegment = spline.getSegmentAt( end );
	}

	getStart (): number {
		return this.start;
	}

	setStart ( value: number ): void {
		this.start = value;
	}

	getEnd (): number {
		return this.end;
	}

	setEnd ( end: number ): void {
		this.end = end;
	}

	getStartSegment (): NewSegment {
		return this.startSegment;
	}

	getEndSegment (): NewSegment {
		return this.endSegment;
	}

	isAtStart (): boolean {
		return this.start <= 0;
	}

	isAtEnd (): boolean {
		return this.end >= this.spline.getLength();
	}

	isAtMiddle (): boolean {
		return !this.isAtStart() && !this.isAtEnd();
	}

	hasDifferentSegments (): boolean {
		return this.getStartSegment() != this.getEndSegment();
	}

	hasDifferentRoads (): boolean {
		return this.getStartSegment() instanceof TvRoad &&
			this.getEndSegment() instanceof TvRoad &&
			this.getStartSegment() !== this.getEndSegment();
	}

	hasSameSegments (): boolean {
		return !this.hasDifferentSegments();
	}

	shouldCreateRoadSegment (): boolean {
		return this.hasSameSegments() && this.isAtMiddle();
	}

	addRoadSegment ( s: number, segment: NewSegment ): void {
		this.spline.addSegment( s, segment );
	}

	isNearJunction (): boolean {
		return this.startSegment instanceof TvJunction || this.endSegment instanceof TvJunction;
	}

	insertJunctionSegment ( junction: NewSegment ): void {

		if ( this.hasDifferentSegments() ) {

			this.spline.addSegment( this.start, junction );
			this.shiftOrRemoveRoadAfterJunction( junction );

			return;
		}

		if ( this.isAtStart() ) {

			this.shiftRoadSegment( this.getStartSegment() as TvRoad, this.end );
			this.spline.addSegment( this.start, junction );

		} else {

			this.spline.addSegment( this.start, junction );
			this.shiftOrRemoveRoadAfterJunction( junction );

		}

	}

	shiftOrRemoveRoadAfterJunction ( junction: NewSegment ): void {

		if ( !this.hasRoadAfterJunction( junction as TvJunction ) ) return;

		const road = this.endSegment as TvRoad;

		if ( this.end < this.spline.getLength() ) {

			this.shiftRoadSegment( this.endSegment as TvRoad, this.end );

			return;
		}

		this.spline.removeSegment( road );

		this.endSegment = junction;

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

	}

	shouldAddRoadAfterJunction ( junction: TvJunction ): boolean {

		return this.isAtMiddle(); //&& this.spline.getNextSegment( junction ) === null;

	}

	hasRoadAfterJunction ( junction: TvJunction ): boolean {

		return this.spline.getNextSegment( junction ) instanceof TvRoad;

	}


	addRoadAfterSection ( newRoad: TvRoad ): void {

		newRoad.sStart = this.end;

		// we reach this point only if the section is in the middle of the spline
		// so we can safely assume that the start segment is a road
		const existingRoad = this.startSegment instanceof TvRoad ?
			this.startSegment :
			this.spline.getPreviousSegment( this.startSegment ) as TvRoad;

		Assert.isTrue( existingRoad instanceof TvRoad, 'The start segment is not a road' );

		existingRoad.successor?.replace( existingRoad, newRoad, TvContactPoint.END );

		newRoad.linkPredecessor( existingRoad, TvContactPoint.END );

		this.spline.addSegment( this.end, newRoad );

	}

	shiftRoadSegment ( road: TvRoad, offset: number ): void {

		road.sStart = this.end;

		this.spline.shiftSegment( offset, road );

	}

	shiftJunctionAndUpdateSegments ( junction: TvJunction, start?: number, end?: number ): void {

		start = start ?? this.start;

		end = end ?? this.end;

		this.spline.shiftSegment( start, junction );

		this.spline.updateLinks();

		this.spline.updateSegmentGeometryAndBounds();

	}

	clone (): SplineSection {

		return new SplineSection( this.spline, this.start, this.end );

	}

	setOffsets ( start: number, end: number ): void {

		this.start = start;
		this.end = end;

	}

	private updateOffsetSegments (): void {

		this.startSegment = this.spline.getSegmentAt( this.start );
		this.endSegment = this.spline.getSegmentAt( this.end );

	}

	updateOffsets ( area: Box2 ): void {

		const offsets = this.computeOffsets( area );

		this.setOffsets( offsets.start, offsets.end );

		this.updateOffsetSegments();

	}

	private computeOffsets ( area: Box2 ) {

		const intersectingOffsets = [ this.start, this.end ];

		for ( let s = 0; s < this.spline.getLength(); s++ ) {

			const point = this.spline.getCoordAtOffset( s );

			if ( area.containsPoint( point.toVector2() ) ) {

				intersectingOffsets.push( s );

			}

		}

		return {
			start: Math.min( ...intersectingOffsets ),
			end: Math.max( ...intersectingOffsets )
		};
	}

}
