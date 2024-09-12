/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { Box2, Box3, MathUtils, Vector3 } from 'three';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { OrderedMap } from "../models/ordered-map";
import { TvPosTheta } from 'app/map/models/tv-pos-theta';

export enum SplineType {
	AUTO = 'auto',
	AUTOV2 = 'autov2',
	EXPLICIT = 'explicit',
	CATMULLROM = 'catmullrom',
}

// newsegment union
export type NewSegment = TvRoad | TvJunction | null;

export abstract class AbstractSpline {

	public abstract type: SplineType;

	public readonly id: number;

	public uuid: string;

	/**
	 * @deprecated dont use this property
	 */
	public depBoundingBox: Box3;

	public boundingBox: Box2;

	public controlPoints: AbstractControlPoint[] = [];

	public segmentMap = new OrderedMap<NewSegment>();

	public geometries: TvAbstractRoadGeometry[] = [];

	public waypoints: AbstractControlPoint[] = [];

	public centerPoints: AbstractControlPoint[] = [];
	public leftPoints: AbstractControlPoint[] = [];
	public rightPoints: AbstractControlPoint[] = [];

	public widthCache: Map<number, number> = new Map();

	public closed: boolean;

	public tension: number;

	private static idCounter = 1;

	static reset () {
		this.idCounter = 1;
	}

	protected constructor ( closed?: boolean, tension?: number ) {

		this.id = AbstractSpline.idCounter++;

		this.uuid = MathUtils.generateUUID();

		this.closed = closed || false;

		this.tension = tension || 0.5;

		this.boundingBox = new Box2();

	}

	get controlPointPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position );
	}

	getControlPoints (): AbstractControlPoint[] {
		return this.controlPoints;
	}

	addControlPoint ( point: AbstractControlPoint ): void {
		this.controlPoints.push( point );
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

	updateHeadings (): void {

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
		return `Spline:${ this.id } Type:${ this.type } Segments:${ this.segmentMap.length } Length:${ this.getLength() } Points:${ this.controlPoints.length } Geometries:${ this.geometries.length }`;
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

	addSegment ( s: number, segment: NewSegment ): void {

		if ( this.hasSegment( segment ) ) {
			throw new Error( `Segment already exists in spline: ${ segment }` );
		}

		if ( this.segmentMap.hasKey( s ) ) {
			throw new Error( `Key already exists in spline: ${ segment }` );
		}

		this.segmentMap.set( s, segment );

	}

	getSegments (): NewSegment[] {
		return Array.from( this.segmentMap.values() );
	}

	getSegmentCount (): number {
		return this.segmentMap.length;
	}

	getLastSegment (): NewSegment {
		return this.segmentMap.getLast();
	}

	getRoadSegments (): TvRoad[] {
		return this.getSegments().filter( segment => segment instanceof TvRoad ) as TvRoad[];
	}

	getJunctionSegments (): TvJunction[] {
		return this.getSegments().filter( segment => segment instanceof TvJunction ) as TvJunction[];
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

	getSuccessor (): NewSegment {

		const lastSegment = this.segmentMap.getLast();

		if ( !lastSegment ) return;

		if ( !( lastSegment instanceof TvRoad ) ) return;

		if ( !lastSegment.successor ) return;

		return lastSegment.successor.element;

	}

	getPredecessor (): NewSegment {

		const segment = this.segmentMap.getFirst();

		if ( !segment ) return;

		if ( !( segment instanceof TvRoad ) ) return;

		if ( !segment.predecessor ) return;

		return segment.predecessor.element;

	}

	hasSegment ( segment: TvJunction | TvRoad ): boolean {
		return this.segmentMap.contains( segment );
	}

	getCoordAtOffset ( sOffset: number ): TvPosTheta {
		for ( const geometry of this.geometries ) {
			if ( sOffset >= geometry.s && sOffset <= geometry.endS ) {
				return geometry.getRoadCoord( sOffset );
			}
		}
	}

}


