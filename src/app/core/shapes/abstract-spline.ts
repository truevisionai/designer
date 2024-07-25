/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { Box3, MathUtils, Vector3 } from 'three';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { OrderedMap } from "../models/ordered-map";

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

	public uuid: string;

	public boundingBox: Box3;

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

	protected constructor ( closed?: boolean, tension?: number ) {

		this.uuid = MathUtils.generateUUID();

		this.closed = closed || false;

		this.tension = tension || 0.5;

	}

	get controlPointPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position );
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

	toString () {
		return `Spline Type:${ this.type } Segments:${ this.segmentMap.length } Length:${ this.getLength() } Points:${ this.controlPoints.length } Geometries:${ this.geometries.length }`;
	}

}


