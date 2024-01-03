import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Box3, Vector3 } from 'three';
import { JunctionConnectionService } from './junction-connection.service';
import { JunctionService } from './junction.service';
import { RoadService } from '../road/road.service';
import { RoadSplineService } from '../road/road-spline.service';
import { MapService } from '../map.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { MapEvents } from 'app/events/map-events';
import { RoadCreatedEvent } from 'app/events/road/road-created-event';
import { RoadUpdatedEvent } from 'app/events/road/road-updated-event';

@Injectable( {
	providedIn: 'root'
} )
export class IntersectionService {

	constructor (
		private mapService: MapService,
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
		private junctionService: JunctionService,
		private junctionConnectionService: JunctionConnectionService,
	) { }

	getRoadIntersectionPoint ( roadA: TvRoad, roadB: TvRoad, stepSize = 1 ): Vector3 | null {

		if ( roadA.id == roadB.id ) return;

		if ( !this.intersectsRoadBox( roadA, roadB ) ) return;

		const pointsA = roadA.getReferenceLinePoints( stepSize );
		const pointsB = roadB.getReferenceLinePoints( stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ].position;
				const b = pointsA[ i + 1 ].position;
				const c = pointsB[ j ].position;
				const d = pointsB[ j + 1 ].position;

				const distance = a.distanceTo( c );

				if ( distance < stepSize ) {

					return this.lineIntersection( a, b, c, d );

				}

			}

		}

	}

	getSplineIntersectionPoint ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = splineA.getPoints( stepSize )
		const pointsB = splineB.getPoints( stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ];
				const b = pointsA[ i + 1 ];
				const c = pointsB[ j ];
				const d = pointsB[ j + 1 ];

				const distance = a.distanceTo( c );

				if ( distance <= stepSize * 2 ) {

					return this.lineIntersection( a, b, c, d );

				}

			}

		}

	}

	checkSplineIntersections ( spline: AbstractSpline ) {

		const splineCount = this.mapService.map.getSplineCount();
		const splines = this.mapService.map.getSplines();

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			const intersection = this.getSplineIntersectionPoint( spline, otherSpline );

			if ( !intersection ) continue;

			this.createSplineIntersection( spline, otherSpline, intersection );

		}

	}

	getSplineIntersections ( spline: AbstractSpline ) {

		const splineCount = this.mapService.map.getSplineCount();
		const splines = this.mapService.map.getSplines();

		const intersections = [];

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			const intersection = this.getSplineIntersectionPoint( spline, otherSpline );

			if ( !intersection ) continue;

			intersections.push( {
				spline: spline,
				otherSpline: otherSpline,
				intersection: intersection
			} );
		}

		return intersections;
	}

	createSplineIntersection ( splineA: AbstractSpline, splineB: AbstractSpline, point: Vector3 ) {

		if ( splineA == splineB ) return;

		const splineCoordA = splineA.getCoordAt( point );
		const splineCoordB = splineB.getCoordAt( point );

		const segmentA = splineA.getSegmentAt( splineCoordA.s );
		const segmentB = splineB.getSegmentAt( splineCoordB.s );

		if ( !segmentA || !segmentA.isRoad ) return;
		if ( !segmentB || !segmentB.isRoad ) return;

		const roadA = this.roadService.getRoad( segmentA.id );
		const roadB = this.roadService.getRoad( segmentB.id );

		if ( !roadA ) return;
		if ( !roadB ) return;

		const coordA = roadA.getPosThetaByPosition( point ).toRoadCoord( roadA );
		const coordB = roadB.getPosThetaByPosition( point ).toRoadCoord( roadB );

		const junction = this.internal_createIntersectionFromCoords( coordA, coordB );

		this.junctionService.addJunction( junction );
	}

	postProcessJunction ( junction: TvJunction ) {

		const roads = junction.getRoads();

		const connections = junction.getConnections();

		function findClosedConnection ( road: TvRoad ) {

			const roadConnections = connections.filter( i => i.incomingRoadId == road.id );

			if ( roadConnections.length == 0 ) return;

			let minAngle = 2 * Math.PI; // Initialize with maximum possible angle (360 degrees)
			let minDistance = Infinity;
			let nearestConnection = null;

			for ( let i = 0; i < roadConnections.length; i++ ) {

				const connection = roadConnections[ i ];

				const connectingRoad = connection.connectingRoad;

				const p1 = connectingRoad.spline.getFirstPoint()
				const p1Direction = p1.getDirectionVector();

				const p2 = connectingRoad.spline.getLastPoint();
				const p2Direction = p2.getDirectionVector().negate();

				const distance = p1.position.distanceTo( p2.position );

				// find angle between road direction and connecting road direction
				let crossProduct = new Vector3().crossVectors( p1Direction, p2Direction );
				let angle = p1Direction.angleTo( p2Direction );

				// Determine if the angle is to the left or right
				if ( crossProduct.z < 0 ) {
					// Angle to the right
					angle = Math.PI * 2 - angle;
				}

				if ( angle < minAngle ) {

					minDistance = distance;
					minAngle = angle;
					nearestConnection = connection;

				}

			}

			return nearestConnection;

		}

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			const nearestConnection = findClosedConnection( road );

			if ( nearestConnection ) {

				this.junctionConnectionService.postProcessConnection( nearestConnection );

			}

		}

	}

	createIntersectionByContact (
		coordA: TvRoadCoord,
		contactA: TvContactPoint,
		coordB: TvRoadCoord,
		contactB: TvContactPoint
	): TvJunction {

		// roads should be different
		if ( coordA.road === coordB.road ) {

			const junction = this.junctionService.createNewJunction();

			const coord = coordA.s > coordB.s ? coordA : coordB;

			const roadC = this.cutRoadForJunction( coord, junction );

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				TvContactPoint.END,
				roadC,
				TvContactPoint.START
			);

			this.postProcessJunction( junction );

			return junction;

		}

		// could be usefull to calculcating if we need
		// to add junction into the roads
		// const distance = coordA.distanceTo( coordB );

		if ( coordA.contactCheck == contactA && coordB.contactCheck == contactB ) {

			const junction = this.junctionService.createNewJunction();

			this.internal_addConnections( junction, coordA, coordB, null, null );

			this.postProcessJunction( junction );

			return junction;

		}

	}

	addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord ) {

		this.junctionService.addConnectionsFromContact(
			junction,
			coordA.road,
			coordA.contact,
			coordB.road,
			coordB.contact
		);

	}

	private intersectsRoadBox ( roadA: TvRoad, roadB: TvRoad ): boolean {

		if ( !roadA.boundingBox ) roadA.computeBoundingBox();
		if ( !roadB.boundingBox ) roadB.computeBoundingBox();

		return this.intersectsBox( roadA.boundingBox, roadB.boundingBox );

	}

	private intersectsSplineBox ( splineA: AbstractSpline, splineB: AbstractSpline ): boolean {

		return this.intersectsBox( splineA.boundingBox, splineB.boundingBox );

	}

	private intersectsBox ( boxA: Box3, boxB: Box3 ): boolean {

		// return true if we box is not generated
		if ( !boxA || !boxB ) return true;

		const boxIntersection = boxA.intersectsBox( boxB );

		return boxIntersection;

	}

	private lineIntersection ( a: Vector3, b: Vector3, c: Vector3, d: Vector3 ): Vector3 | null {

		// Direction vectors for the lines
		const dir1 = b.clone().sub( a );
		const dir2 = d.clone().sub( c );

		// Vector from a to c
		const ac = c.clone().sub( a );

		// Check if lines are parallel (cross product is zero)
		const crossDir1Dir2 = dir1.clone().cross( dir2 );
		if ( crossDir1Dir2.lengthSq() === 0 ) return null; // Lines are parallel

		// Compute the parameters t and s
		const t = ( ac.clone().cross( dir2 ).dot( crossDir1Dir2 ) ) / crossDir1Dir2.lengthSq();
		const s = ( ac.clone().cross( dir1 ).dot( crossDir1Dir2 ) ) / crossDir1Dir2.lengthSq();

		// Compute the closest points on the lines
		const closestPtOnLine1 = a.clone().add( dir1.multiplyScalar( t ) );
		const closestPtOnLine2 = c.clone().add( dir2.multiplyScalar( s ) );

		// Check if the closest points are the same (within a small tolerance)
		if ( closestPtOnLine1.distanceTo( closestPtOnLine2 ) < 1e-6 ) {
			return closestPtOnLine1; // Intersection point
		}

		return null; // Lines do not intersect

	}

	cutRoadForJunction ( coord: TvRoadCoord, junction: TvJunction ): TvRoad {

		function isNearRoadStartOrEnd ( coord: TvRoadCoord, width: number ) {

			const isOver = coord.s + width >= coord.road.length;
			const isUnder = coord.s - width <= 0;

			return isOver || isUnder;

		}

		const junctionWidth = coord.road.getRoadWidthAt( coord.s ).totalWidth;

		let newRoad: TvRoad

		if ( !isNearRoadStartOrEnd( coord, junctionWidth ) ) {

			const sStartJunction = coord.road.sStart + coord.s - junctionWidth;
			const sEndJunction = coord.road.sStart + coord.s + junctionWidth;

			this.roadSplineService.addJunctionSegment( coord.road.spline, sStartJunction, junction );

			if ( sEndJunction < coord.road.spline.getLength() ) {

				newRoad = this.roadService.clone( coord.road, coord.s + junctionWidth );

				newRoad.sStart = sEndJunction;

				this.roadSplineService.addRoadSegmentNew( coord.road.spline, newRoad.sStart, newRoad );

			}

			coord.road.length = sStartJunction;

			coord.s -= junctionWidth;

		} else {

			const isOver = coord.s + junctionWidth >= coord.road.length;
			const isUnder = coord.s - junctionWidth <= 0;

			if ( isOver ) {

				const sStartJunction = coord.road.length - junctionWidth;
				const sEndJunction = coord.road.length;

				coord.road.spline.addJunctionSegment( sStartJunction, junction );

				coord.road.length = sStartJunction;

				coord.s = sStartJunction;

			} else if ( isUnder ) {

				const sStartJunction = 0;
				const sEndJunction = junctionWidth;

				const roadSegment = coord.road.spline.getSegmentAt( 0 );

				roadSegment.setStart( sEndJunction );
				coord.road.length = coord.road.length - sEndJunction;

				coord.road.spline.addJunctionSegment( sStartJunction, junction );

				coord.s = sStartJunction;

			}

		}

		if ( newRoad ) {

			MapEvents.roadCreated.emit( new RoadCreatedEvent( newRoad ) );
			MapEvents.roadUpdated.emit( new RoadUpdatedEvent( coord.road ) );

			return newRoad;

		}
	}

	private internal_createIntersectionFromCoords ( coordA: TvRoadCoord, coordB: TvRoadCoord ): TvJunction {

		const junction = this.junctionService.createNewJunction();

		const roadC = this.cutRoadForJunction( coordA, junction );
		const roadD = this.cutRoadForJunction( coordB, junction );

		this.internal_addConnections( junction, coordA, coordB, roadC, roadD );

		this.postProcessJunction( junction );

		return junction;

	}

	private internal_addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord, roadC: TvRoad, roadD: TvRoad ) {

		this.junctionService.addConnectionsFromContact(
			junction,
			coordA.road,
			coordA.contact,
			coordB.road,
			coordB.contact
		);

		if ( roadC ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				coordA.contact,
				roadC,
				TvContactPoint.START
			);

			this.junctionService.addConnectionsFromContact(
				junction,
				coordB.road,
				coordB.contact,
				roadC,
				TvContactPoint.START
			);
		}

		if ( roadD ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				coordB.road,
				coordB.contact,
				roadD,
				TvContactPoint.START
			);

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				coordA.contact,
				roadD,
				TvContactPoint.START
			);

		}

		if ( roadC && roadD ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				roadC,
				TvContactPoint.START,
				roadD,
				TvContactPoint.START
			);

		}

	}
}
