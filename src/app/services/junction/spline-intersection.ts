/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline, NewSegment } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Box2, Vector2, Vector3 } from 'three';


export class SplineIntersection {

	public area: Box2;

	private _splineStart: number;
	private _splineEnd: number;

	private _otherStart: number;
	private _otherEnd: number;

	constructor (
		public spline: AbstractSpline,
		public otherSpline: AbstractSpline,
		public position: Vector3,
		public angle?: number
	) {
	}

	get splineStart (): number {
		return this._splineStart;
	}

	set splineStart ( value: number ) {
		this._splineStart = value;
	}

	get splineEnd (): number {
		return this._splineEnd;
	}

	set splineEnd ( value: number ) {
		this._splineEnd = value;
	}

	get otherStart (): number {
		return this._otherStart;
	}

	set otherStart ( value: number ) {
		this._otherStart = value;
	}

	get otherEnd (): number {
		return this._otherEnd;
	}

	set otherEnd ( value: number ) {
		this._otherEnd = value;
	}

	getKey (): string {
		return this.getSplines().map( s => s.uuid ).sort().join( '_' );
	}

	getSplineSections (): SplineSection[] {
		return [
			new SplineSection( this.spline, this.splineStart, this.splineEnd ),
			new SplineSection( this.otherSpline, this.otherStart, this.otherEnd )
		]
	}

	getSplines (): AbstractSpline[] {
		return [ this.spline, this.otherSpline ];
	}

	isNearJunction (): boolean {
		return this.getSplineSections().some( section => section.isNearJunction() );
	}

}

export class SplineSection {

	private startSegment: NewSegment;
	private endSegment: NewSegment;

	constructor (
		public readonly spline: AbstractSpline,
		private readonly start: number,
		private readonly end: number
	) {
		this.startSegment = spline.getSegmentAt( start );
		this.endSegment = spline.getSegmentAt( end );
	}

	getStart () {
		return this.start;
	}

	getEnd () {
		return this.end;
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

			this.shiftSegment( this.getEndSegment(), this.end );

		} else {

			if ( this.isAtStart() ) {
				this.shiftSegment( this.getStartSegment(), this.end );
			}

			this.spline.addSegment( this.start, junction );

		}

	}

	shiftSegment ( segment: NewSegment, offser: number ): void {

		if ( segment instanceof TvRoad ) {
			segment.sStart = this.end;
		}

		this.spline.removeSegment( segment );

		this.spline.addSegment( offser, segment );

	}

}
