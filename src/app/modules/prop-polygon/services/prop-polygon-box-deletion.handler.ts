/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ScopedDeletionHandler, ScopedDeletionRequest } from 'app/tools/deletion/scoped-deletion.handler';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { PropPolygonPoint } from '../objects/prop-polygon-point';

const enum DeletionPriority {
	Polygon = 0,
	Point = 1
}

type PolygonDeletionTarget = PropPolygon | PropPolygonPoint;

interface PolygonScopedDeletionRequest extends ScopedDeletionRequest<PolygonDeletionTarget> {
	target: PolygonDeletionTarget;
}

interface PolygonPointSelectionGroup {
	points: Set<PropPolygonPoint>;
	minOrder: number;
}

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonBoxDeletionHandler extends ScopedDeletionHandler<PolygonDeletionTarget> {

	// eslint-disable-next-line max-lines-per-function
	protected buildRequests ( selection: PolygonDeletionTarget[] ): PolygonScopedDeletionRequest[] {

		const polygonOrder = new Map<PropPolygon, number>();

		const pointOrder = new Map<PropPolygonPoint, number>();
		const pointsByPolygon = new Map<PropPolygon, PolygonPointSelectionGroup>();
		const promotedPolygons = new Set<PropPolygon>();

		selection.forEach( ( candidate, order ) => {

			if ( candidate instanceof PropPolygon ) {

				const currentOrder = polygonOrder.get( candidate );

				if ( currentOrder === undefined || order < currentOrder ) {
					polygonOrder.set( candidate, order );
				}

				return;
			}

			if ( !( candidate instanceof PropPolygonPoint ) ) return;

			pointOrder.set( candidate, Math.min( order, pointOrder.get( candidate ) ?? order ) );

			const group = pointsByPolygon.get( candidate.polygon ) || { points: new Set(), minOrder: order };

			group.points.add( candidate );
			group.minOrder = Math.min( group.minOrder, order );

			pointsByPolygon.set( candidate.polygon, group );

		} );

		pointsByPolygon.forEach( ( group, polygon ) => {

			const totalPoints = polygon.spline?.getControlPointCount() ?? 0;

			if ( totalPoints === 0 ) return;

			if ( group.points.size >= totalPoints ) {

				promotedPolygons.add( polygon );

				const newOrder = Math.min( polygonOrder.get( polygon ) ?? Number.POSITIVE_INFINITY, group.minOrder );

				polygonOrder.set( polygon, newOrder );

			}

		} );

		const requests: PolygonScopedDeletionRequest[] = [];

		Array
			.from( polygonOrder.entries() )
			.sort( ( [ , orderA ], [ , orderB ] ) => orderA - orderB )
			.forEach( ( [ polygon, order ] ) => {
				requests.push( {
					target: polygon,
					order,
					priority: DeletionPriority.Polygon
				} );
			} );

		pointsByPolygon.forEach( ( group, polygon ) => {

			if ( polygonOrder.has( polygon ) || promotedPolygons.has( polygon ) ) return;

			Array
				.from( group.points.values() )
				.sort( ( a, b ) => {
					const orderA = pointOrder.get( a ) ?? Number.MAX_SAFE_INTEGER;
					const orderB = pointOrder.get( b ) ?? Number.MAX_SAFE_INTEGER;
					return orderA - orderB;
				} )
				.forEach( point => {
					requests.push( {
						target: point,
						order: pointOrder.get( point ) ?? Number.MAX_SAFE_INTEGER,
						priority: DeletionPriority.Point
					} );
				} );

		} );

		return requests;
	}

}

