/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline, SplineType } from './abstract-spline';
import { BufferGeometry, Line } from 'three';

export class ExplicitSpline extends AbstractSpline {

	public type: SplineType = SplineType.EXPLICIT;

	public lines: Line<BufferGeometry>[] = [];

	constructor ( private road?: TvRoad ) {

		super();

	}

	init (): void { }

	update (): void { }

}
