/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { Box2, Box3, MathUtils, Vector2, Vector3 } from 'three';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { OrderedMap } from "../models/ordered-map";
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { TvLink } from 'app/map/models/tv-link';
import {
	DuplicateKeyException,
	DuplicateModelException,
	InvalidArgumentException,
	ModelNotFoundException
} from 'app/exceptions/exceptions';
import { MapEvents } from 'app/events/map-events';
import { findIntersectionsViaBox2D } from 'app/services/spline/spline-intersection.service';
import { SplineSegmentProfile } from './spline-segment-profile';
import { SplineLinks } from './spline-links';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvMap } from 'app/map/models/tv-map.model';

export enum SplineType {
	AUTO = 'auto',
	AUTOV2 = 'autov2',
	EXPLICIT = 'explicit',
	CATMULLROM = 'catmullrom',
}

export type NewSegment = TvRoad | TvJunction | null;

export abstract class AbstractSpline {

	public abstract type: SplineType;

	public readonly id: number;

	public uuid: string;

	public boundingBox: Box2;

	public controlPoints: AbstractControlPoint[] = [];

	private geometries: TvAbstractRoadGeometry[] = [];

	public waypoints: AbstractControlPoint[] = [];

	public centerPoints: AbstractControlPoint[] = [];
	public leftPoints: AbstractControlPoint[] = [];
	public rightPoints: AbstractControlPoint[] = [];

	public widthCache: Map<number, number> = new Map();

	public closed: boolean;

	public tension: number;

	private static idCounter = 1;

	private splineSegmentProfile: SplineSegmentProfile;
	private splineLinks: SplineLinks;

	private map: TvMap;

	static reset () {
		this.idCounter = 1;
	}

	abstract getPoints ( stepSize: number ): Vector3[];

	abstract updateSegmentGeometryAndBounds (): void;

	protected constructor ( closed?: boolean, tension?: number ) {

		this.id = AbstractSpline.idCounter++;

		this.uuid = MathUtils.generateUUID();

		this.closed = closed || false;

		this.tension = tension || 0.5;

		this.boundingBox = new Box2();

		this.splineSegmentProfile = new SplineSegmentProfile( this );

		this.splineLinks = new SplineLinks( this );

	}

	private get segments () {
		return this.splineSegmentProfile.getSegmentMap();
	}

	setMap ( map: TvMap ): void { this.map = map; }

	getMap (): TvMap { return this.map; }

	get controlPointPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position );
	}

	getControlPoints (): AbstractControlPoint[] {
		return this.controlPoints;
	}

	addControlPoint ( point: AbstractControlPoint ): void {
		this.controlPoints.push( point );
	}

	insertControlPoint ( index: number, point: AbstractControlPoint ): void {
		this.controlPoints.splice( index, 0, point );
	}

	removeControlPoint ( point: AbstractControlPoint ): void {
		const index = this.controlPoints.indexOf( point );
		if ( index !== -1 ) {
			this.controlPoints.splice( index, 1 );
		}
	}

	addControlPoints ( points: AbstractControlPoint[] ): void {
		this.controlPoints.push( ...points );
	}

	getControlPointCount (): number {
		return this.controlPoints.length;
	}

	getPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position.clone() );
	}

	getFirstPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 1 ? this.controlPoints[ 0 ] : null;
	}

	getSecondPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 2 ? this.controlPoints[ 1 ] : null;
	}

	getLastPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 1 ? this.controlPoints[ this.controlPoints.length - 1 ] : null;
	}

	getSecondLastPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 2 ? this.controlPoints[ this.controlPoints.length - 2 ] : null;
	}

	update () {
	}

	getLength (): number {

		let length = 0;

		this.geometries.forEach( geometry => length += geometry.length );

		return length;

	}

	updateIndexes (): void {
		this.controlPoints.forEach( ( point, index ) => point.index = index );
	}

	toString () {
		return `Spline:${ this.id } Type:${ this.type } Segments:${ this.segments.length } Length:${ this.getLength() } Points:${ this.controlPoints.length } Geometries:${ this.geometries.length }`;
	}

	clearGeometries (): void {
		this.geometries = [];
	}

	clearSegmentGeometries (): void {
		this.getRoadSegments().forEach( segment => segment.clearGeometryAndUpdateCoords() );
	}

	addGeometry ( geometry: TvAbstractRoadGeometry ): void {
		this.geometries.push( geometry );
	}

	getGeometryCount (): number {
		return this.geometries.length;
	}

	getGeometries (): TvAbstractRoadGeometry[] {
		return this.geometries;
	}

	setGeometries ( geometries: TvAbstractRoadGeometry[] ): void {
		this.geometries = geometries;
	}

	addSegment ( sOffset: number, segment: NewSegment ): void {

		this.validateForAdding( sOffset, segment );

		this.segments.remove( segment );

		this.segments.set( sOffset, segment );

		if ( segment instanceof TvRoad ) {
			segment.spline = this;
			segment.sStart = sOffset;
		}

	}

	shiftSegment ( offset: number, segment: NewSegment ): void {

		this.removeSegment( segment );

		this.addSegment( offset, segment );

	}

	shiftSegmentAndUpdateLinks ( offset: number, segment: NewSegment ): void {

		const prevSegment = this.getPreviousSegment( segment );
		const nextSegment = this.getNextSegment( segment );

		if ( prevSegment instanceof TvRoad ) prevSegment.successor = null;
		if ( nextSegment instanceof TvRoad ) nextSegment.predecessor = null;

		this.removeSegment( segment );

		this.addSegment( offset, segment );

	}

	removeSegment ( segment: NewSegment ): void {

		if ( !this.hasSegment( segment ) ) {
			throw new ModelNotFoundException( `Segment not found: ${ segment?.toString() }` );
		}

		this.segments.remove( segment );

	}

	removeJunctionSegmentAndUpdate ( junction: TvJunction ): void {

		const junctionStart = this.segments.findKey( junction );

		const prevSegment = this.getPreviousSegment( junction );
		const nextSegment = this.getNextSegment( junction );

		this.removeSegment( junction );

		if ( junctionStart == 0 ) {

			this.shiftSegment( 0, nextSegment );

			if ( nextSegment instanceof TvRoad ) nextSegment.predecessor = null;

		} else if ( nextSegment instanceof TvRoad && prevSegment instanceof TvRoad ) {

			prevSegment.successor = nextSegment.successor?.clone();

			nextSegment.successor?.replace( nextSegment, prevSegment, TvContactPoint.END );

			this.removeSegment( nextSegment );

			this.map.removeRoad( nextSegment );

			MapEvents.removeMesh.emit( nextSegment );

		} else if ( nextSegment == null && prevSegment instanceof TvRoad ) {

			prevSegment.successor = null;

		}

		this.updateLinks();

		this.updateSegmentGeometryAndBounds();

	}

	removeSegmentAndReplaceLinks ( segment: NewSegment ): void {

		this.splineLinks.removeSegmentAndReplaceLinks( segment );

	}

	private validateForAdding ( sOffset: number, segment: NewSegment ): void {

		if ( this.hasSegment( segment ) ) {
			throw new DuplicateModelException( `Segment exists: ${ segment }` );
		}

		if ( this.segments.hasKey( sOffset ) ) {
			throw new Error( `Key: ${ sOffset } exists New:${ segment }` );
		}

		// NOTE: CAUSES ERROR DURING SCENE LOAD
		// if ( sOffset > this.getLength() ) {
		// 	throw new InvalidArgumentException( `sOffset must be less than end: ${ sOffset }, ${ this.toString() }` );
		// }

		if ( sOffset < 0 ) {
			throw new InvalidArgumentException( `sOffset must be greater than 0: ${ sOffset }, ${ this.toString() }` );
		}

		if ( sOffset == null ) {
			throw new InvalidArgumentException( `sOffset is null: ${ sOffset }, ${ this.toString() }, ${ segment?.toString() }` );
		}

		if ( this.segments.hasKey( sOffset ) ) {
			throw new DuplicateKeyException( `sOffset already occupied: ${ sOffset }, ${ segment?.toString() }, ${ this.segments.keys() }` );
		}

	}

	isConnectingRoad (): boolean {

		if ( this.getSegmentCount() !== 1 ) {
			return false;
		}

		if ( !this.isFirstSegmentRoad() ) {
			return false;
		}

		return this.getFirstSegment<TvRoad>().isJunction;
	}

	getNextSegment ( segment: NewSegment ): NewSegment {
		return this.segments.getNext( segment );
	}

	getPreviousSegment ( segment: NewSegment ): NewSegment {
		return this.segments.getPrevious( segment );
	}

	forEachSegment ( callback: ( segment: NewSegment, s: number ) => void ): void {
		this.segments.forEach( callback );
	}

	getSegments (): NewSegment[] {
		return Array.from( this.segments.values() );
	}

	getSegmentAt ( s: number ): NewSegment {
		if ( s < 0 ) {
			throw new InvalidArgumentException( `s must be greater than 0: ${ s }` );
		}
		if ( s > this.getLength() ) {
			throw new InvalidArgumentException( `s must be less than length: ${ s }` );
		}
		return this.segments.findAt( s );
	}

	getSegmentStart ( segment: NewSegment ): number {
		return this.splineSegmentProfile.getSegmentStart( segment );
	}

	getSegmentEnd ( segment: NewSegment ): number {
		return this.splineSegmentProfile.getSegmentEnd( segment );
	}

	getSegmentStartEnd ( segment: NewSegment ): { start: number; end: number; } {
		return this.splineSegmentProfile.getStartEnd( segment );
	}

	getSegmentCount (): number {
		return this.segments.length;
	}

	getFirstSegment<T extends NewSegment> (): T {
		return this.segments.getFirst() as T;
	}

	getLastSegment<T extends NewSegment> (): T {
		return this.segments.getLast() as T;
	}

	getRoadSegments (): TvRoad[] {
		return this.getSegments().filter( segment => segment instanceof TvRoad ) as TvRoad[];
	}

	getJunctionSegments (): TvJunction[] {
		return this.getSegments().filter( segment => segment instanceof TvJunction ) as TvJunction[];
	}

	hasLinks (): boolean {
		return this.hasPredecessor() || this.hasSuccessor();
	}

	hasSuccessor (): boolean {
		return !!this.getSuccessor();
	}

	hasPredecessor (): boolean {
		return !!this.getPredecessor();
	}

	successorIsRoad (): boolean {
		return this.getSuccessor() instanceof TvRoad;
	}

	isLastSegmentRoad (): boolean {
		return this.getLastSegment() instanceof TvRoad;
	}

	isFirstSegmentRoad (): boolean {
		return this.getSegments()[ 0 ] instanceof TvRoad;
	}

	getLinkedSplines (): AbstractSpline[] {
		const linkedSplines = new Set<AbstractSpline>();
		const next = this.getSuccessorSpline();
		const previous = this.getPredecessorSpline();
		if ( next ) linkedSplines.add( next );
		if ( previous ) linkedSplines.add( previous );
		return [ ...linkedSplines ];
	}

	getSuccessorSpline (): AbstractSpline | undefined {
		if ( this.isLastSegmentRoad() ) {
			return this.getLastSegment<TvRoad>().getSuccessorSpline();
		}
	}

	getPredecessorSpline (): AbstractSpline | undefined {
		if ( this.isFirstSegmentRoad() ) {
			return this.getFirstSegment<TvRoad>().getPredecessorSpline();
		}
	}

	getSuccessor (): NewSegment | undefined {
		return this.getSuccessorLink()?.getElement();
	}

	getSuccessorLink (): TvLink | undefined {
		if ( this.isLastSegmentRoad() ) {
			return this.getLastSegment<TvRoad>().successor;
		}
	}

	getPredecessor (): NewSegment | undefined {
		return this.getPredecessorLink()?.getElement();
	}

	getPredecessorLink (): TvLink | undefined {
		if ( this.isFirstSegmentRoad() ) {
			return this.getFirstSegment<TvRoad>().predecessor;
		}
	}

	hasSegment ( segment: NewSegment ): boolean {
		return this.segments.contains( segment );
	}

	isLinkedToJunction (): boolean {
		return this.getSuccessor() instanceof TvJunction || this.getPredecessor() instanceof TvJunction;
	}

	getIntersections ( otherSpline: AbstractSpline ) {
		return findIntersectionsViaBox2D( this, otherSpline );
	}

	getCoordAtOffset ( sOffset: number ): TvPosTheta {
		for ( const geometry of this.geometries ) {
			if ( sOffset >= geometry.s && sOffset <= geometry.endS ) {
				return geometry.getRoadCoord( sOffset );
			}
		}
	}

	getCoordAtPosition ( point: Vector3 ): TvPosTheta {

		let minDistance = Number.MAX_SAFE_INTEGER;

		const coordinates = new TvPosTheta();

		for ( const geometry of this.getGeometries() ) {

			const temp = new TvPosTheta();
			const nearestPoint = geometry.getNearestPointFrom( point.x, point.y, temp );
			const distance = new Vector2( point.x, point.y ).distanceTo( nearestPoint );

			if ( distance < minDistance ) {
				minDistance = distance;
				coordinates.copy( temp );
			}

		}

		return coordinates;
	}

	protected fireMakeSegmentMeshEvents (): void {
		for ( const segment of this.segments.toArray() ) {
			if ( segment instanceof TvRoad ) {
				MapEvents.makeMesh.emit( segment );
			}
		}
	}

	insertSegment ( sStart: number, sEnd: number, segment: NewSegment ): void {
		this.splineSegmentProfile.insertSegment( sStart, sEnd, segment );
	}

	updateLinks (): void {
		this.splineLinks.updateLinks();
	}

	getSegmentLinks ( segment: NewSegment ): TvLink[] {
		return this.splineLinks.getSegmentLinks( segment );
	}

	getSegmentKeys (): number[] {
		return [ ...this.segments.keys() ];
	}

	getNextSegmentKey ( segment: NewSegment ): number {
		return this.segments.getNextKey( segment );
	}

	equals ( spline: AbstractSpline ): boolean {
		return this.uuid === spline.uuid;
	}

	isLinkedTo ( spline: AbstractSpline ): boolean {
		return this.getSuccessorSpline()?.equals( spline ) ||
			this.getPredecessorSpline()?.equals( spline );
	}

	createBoundingBoxAt ( i: number, stepSize: number = 1 ): Box2 {

		const leftStart = this.leftPoints[ i ]?.position;
		const rightStart = this.rightPoints[ i ]?.position;
		const leftEnd = this.leftPoints[ i + stepSize ]?.position;
		const rightEnd = this.rightPoints[ i + stepSize ]?.position;

		if ( !leftStart || !rightStart || !leftEnd || !rightEnd ) return;

		// Use the left and right points to directly define the box boundaries
		const points = [
			new Vector2( leftStart.x, leftStart.y ),
			new Vector2( rightStart.x, rightStart.y ),
			new Vector2( leftEnd.x, leftEnd.y ),
			new Vector2( rightEnd.x, rightEnd.y )
		];

		// Create a Box2 that bounds the road segment
		return new Box2().setFromPoints( points );

	}

}
