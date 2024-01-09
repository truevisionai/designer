/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvOrientation } from 'app/modules/tv-map/models/tv-common';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvVirtualJunction } from 'app/modules/tv-map/models/junctions/tv-virtual-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { IDService } from './id.service';
import { Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionFactory {

	public IDService = new IDService();

	private reset () {

		this.IDService = new IDService();

	}

	createJunction ( junctionName?: string, junctionId?: number ): TvJunction {

		const id = this.IDService.getNextId( junctionId );

		const name = junctionName || `Junction${ id }`;

		return new TvJunction( name, id );

	}

	createVirtualJunction ( mainRoad: TvRoad, sStart: number, sEnd: number, orientation: TvOrientation ): TvVirtualJunction {

		const id = this.IDService.getNextId();

		const name = `VirtualJunction${ id }`;

		return new TvVirtualJunction( name, id, mainRoad, sStart, sEnd, orientation );

	}

	// static connectTwo ( entry: JunctionEntryObject, exit: JunctionEntryObject ) {
	//
	// 	throw new Error( 'Method not implemented.' );
	//
	// }

	// static createJunctions () {
	//
	// 	const roads = TvMapInstance.map.getRoads();
	//
	// 	const entries = this.createEntries( roads );
	//
	// 	this.mergeEntries( entries );
	// }

	// static showJunctionEntries () {
	//
	// 	const roads = TvMapInstance.map.getRoads();
	//
	// 	const entries = this.createEntries( roads );
	//
	// 	entries.forEach( entry => {
	//
	// 		SceneService.addToMain( entry );
	//
	// 	} );
	// }

	// static createJunctionEntries ( allRoads: TvRoad[] ): JunctionEntryObject[] {
	//
	// 	const roads = allRoads.filter( road => !road.isJunction );
	//
	// 	return this.createEntries( roads );
	//
	// }

	// static createEntries ( roads: TvRoad[] ) {
	//
	// 	const entries: JunctionEntryObject[] = [];
	//
	// 	for ( let i = 0; i < roads.length; i++ ) {
	//
	// 		entries.push( ...this.createJunctionEntriesForRoad( roads[ i ], TvContactPoint.START ) );
	//
	// 		entries.push( ...this.createJunctionEntriesForRoad( roads[ i ], TvContactPoint.END ) );
	//
	// 	}
	//
	// 	return entries;
	// }

	//createJunctionEntriesForRoad ( road: TvRoad, contact: TvContactPoint ): JunctionEntryObject[] {
	//
	//	// we dont want create junction points if predecessor or successor is road
	//	// junction points are created with when road is not connected or connected to junction
	//
	//	if ( contact == TvContactPoint.START && road.predecessor?.elementType == 'road' ) {
	//		return [];
	//	}
	//
	//	if ( contact == TvContactPoint.END && road.successor?.elementType == 'road' ) {
	//		return [];
	//	}
	//
	//	const laneSection = contact == TvContactPoint.START ?
	//		road.getFirstLaneSection() :
	//		road.getLastLaneSection();
	//
	//	if ( !laneSection ) TvConsole.error( 'No lane section found for Road: ' + road.id );
	//	if ( !laneSection ) return [];
	//
	//	const lanes = laneSection.getLaneArray().filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving );
	//
	//	return lanes.map( lane => this.createJunctionEntry( road, lane, contact ) );
	//}

	//createJunctionEntry ( road: TvRoad, lane: TvLane, contact: TvContactPoint ): JunctionEntryObject {
	//
	//	const s = contact == TvContactPoint.START ? 0 : road.length;
	//
	//	const position = TvMapQueries.getLanePosition( road.id, lane.id, s );
	//
	//	const name = `road-${ road.id }-lane-${ lane.id }-${ contact }`;
	//
	//	return new JunctionEntryObject( name, position, contact, road, lane );
	//}

	// static mergeEntries ( objects: JunctionEntryObject[] ) {
	//
	// 	const roads = this.groupEntriesByRoad( objects );
	//
	// 	const junctions = new Map<number, TvJunction>();
	//
	// 	objects.filter( i => i.junction != null ).forEach( e => junctions.set( e.junction.id, e.junction ) );
	//
	// 	if ( junctions.size == 0 ) {
	//
	// 		const junction = JunctionFactory.addJunction();
	//
	// 		this.mergeEntriesV3( junction, objects );
	//
	// 	} else if ( junctions.size == 1 ) {
	//
	// 		const junction = junctions.values().next().value;
	//
	// 		this.mergeEntriesV3( junction, objects );
	//
	// 	} else {
	//
	// 		TvConsole.warn( 'Multiple junctions entries cannot be auto-merged' );
	//
	// 	}
	//
	// }

	// // merging entries based on angle
	// static mergeComplexEntries ( objects: JunctionEntryObject[] ) {

	// 	const results = [];

	// 	for ( let i = 0; i < objects.length; i++ ) {

	// 		const A = objects[ i ];

	// 		const mergeOptions = objects
	// 			.filter( B => B.road.id !== A.road.id )
	// 			.filter( B => B.junctionType != A.junctionType )
	// 			.filter( B => !A.canConnect( B ) )
	// 			.forEach( B => {

	// 				const aPos = A.getJunctionPosTheta();
	// 				const bPos = B.getJunctionPosTheta();

	// 				const sideAngle = aPos.computeSideAngle( bPos );

	// 				if ( sideAngle.angleDiff <= 20 ) {

	// 					// for straight connections we only merge same lane-id
	// 					if ( Math.abs( A.lane.id ) != Math.abs( B.lane.id ) ) return;

	// 					console.log( 'straight' );

	// 					const entry = A.isEntry ? A : B;

	// 					const exit = A.isExit ? A : B;

	// 					this.connect( entry, exit );

	// 				} else if ( sideAngle.side == TvLaneSide.LEFT ) {

	// 					if ( B.isLastDrivingLane() ) return;

	// 					console.log( 'left' );

	// 					const entry = A.isEntry ? A : B;

	// 					const exit = A.isExit ? A : B;

	// 					this.connect( entry, exit );

	// 				} else if ( sideAngle.side == TvLaneSide.RIGHT ) {

	// 					if ( B.isLastDrivingLane() ) return;

	// 					console.log( 'right' );

	// 					const entry = A.isEntry ? A : B;

	// 					const exit = A.isExit ? A : B;

	// 					this.connect( entry, exit );

	// 				}

	// 			} );

	// 		console.log( A, mergeOptions );

	// 	}
	// }

	// static straightConnection ( entry: JunctionEntryObject, exit: JunctionEntryObject ) {

	// 	const aPos = entry.getJunctionPosTheta();
	// 	const bPos = exit.getJunctionPosTheta();

	// 	const sideAngle = aPos.computeSideAngle( bPos );

	// 	if ( sideAngle.angleDiff <= 20 ) {

	// 		// for straight connections we only merge same lane-id
	// 		if ( Math.abs( entry.lane.id ) != Math.abs( exit.lane.id ) ) return;

	// 		console.log( 'straight' );

	// 		this.connect( entry, exit );

	// 	}

	// 	// else if ( sideAngle.side == TvLaneSide.LEFT ) {

	// 	// 	if ( exit.isLastDrivingLane() ) return;

	// 	// 	console.log( 'left' );

	// 	// 	this.connect( entry, exit );

	// 	// } else if ( sideAngle.side == TvLaneSide.RIGHT ) {

	// 	// 	if ( exit.isLastDrivingLane() ) return;

	// 	// 	console.log( 'right' );

	// 	// 	this.connect( entry, exit );

	// 	// }

	// }

	//static mergeEntriesV3 ( junction: TvJunction, objects: JunctionEntryObject[] ) {
	//
	//	const roads = this.groupEntriesByRoad( objects );
	//	const keys = Array.from( roads.keys() );
	//
	//	// straight connections
	//	for ( let i = 0; i < objects.length; i++ ) {
	//
	//		const left = objects[ i ];
	//
	//		for ( let j = i + 1; j < objects.length; j++ ) {
	//
	//			const right = objects[ j ];
	//
	//			if ( left.canConnect( right ) && left.isStraightConnection( right ) ) {
	//
	//				const entry = left.isEntry ? left : right;
	//				const exit = left.isExit ? left : right;
	//
	//				this.connect( junction, entry, exit );
	//			}
	//		}
	//	}
	//
	//	for ( let i = 0; i < keys.length; i++ ) {
	//
	//		const road1 = roads.get( keys[ i ] );
	//
	//		for ( let j = i + 1; j < keys.length; j++ ) {
	//
	//			const road2 = roads.get( keys[ j ] );
	//
	//			this.makeRightManeuvers( junction, road1, road2 );
	//			this.makeRightManeuvers( junction, road2, road1 );
	//
	//			this.makeLeftManeuvers( junction, road1, road2 );
	//			this.makeLeftManeuvers( junction, road2, road1 );
	//
	//		}
	//	}
	//
	//}

	//static groupEntriesByRoad ( objects: JunctionEntryObject[] ): Map<number, JunctionEntryObject[]> {
	//
	//	const roads = new Map<number, JunctionEntryObject[]>();
	//
	//	objects.forEach( entry => {
	//
	//		if ( !roads.has( entry.road.id ) ) {
	//			roads.set( entry.road.id, [] );
	//		}
	//
	//		roads.get( entry.road.id ).push( entry );
	//
	//	} );
	//
	//	return roads;
	//}

	//connect ( junction: TvJunction, entry: JunctionEntryObject, exit: JunctionEntryObject ) {

		// if ( !junction ) {

		// 	( new CreateSingleManeuver( null, entry, exit, junction, null, null ) ).execute();

		// } else {

		// 	const connection = junction.findRoadConnection( entry.road, exit.road );

		// 	const laneLink = connection?.laneLink.find( i => i.from === entry.lane.id );

		// 	if ( connection && laneLink ) {

		// 		TvConsole.warn( 'Connection already exists' );

		// 	} else {

		// 		( new CreateSingleManeuver( null, entry, exit, junction, connection, laneLink ) ).execute();

		// 	}

		// }

	//}

	//static makeRightManeuvers ( junction: TvJunction, listA: JunctionEntryObject[], listB: JunctionEntryObject[] ) {
	//
	//	const inDescOrder = ( a, b ) => a.id > b.id ? -1 : 1;
	//	const inAscOrder = ( a, b ) => a.id > b.id ? 1 : -1;
	//
	//	const contactA = listA[ 0 ].contact;
	//	const finalA = listA
	//		.filter( e => contactA == TvContactPoint.END ? e.lane.isRight : e.lane.isLeft )
	//		.sort( contactA == TvContactPoint.START ? inAscOrder : inDescOrder );
	//
	//	const contactB = listB[ 0 ].contact;
	//	const finalB = listB
	//		.filter( e => contactB == TvContactPoint.END ? e.lane.isLeft : e.lane.isRight )
	//		.sort( contactB == TvContactPoint.START ? inDescOrder : inAscOrder );
	//
	//	for ( let i = 0; i < finalA.length; i++ ) {
	//
	//		const element = finalA[ i ];
	//
	//		if ( i < finalB.length ) {
	//
	//			const otherElement = finalB[ i ];
	//
	//			if ( !element.isRightConnection( otherElement ) ) continue;
	//
	//			const entry = element.isEntry ? element : otherElement;
	//
	//			const exit = element.isExit ? element : otherElement;
	//
	//			if ( !entry.isRightMost() ) continue;
	//
	//			this.connect( junction, entry, exit );
	//
	//		}
	//	}
	//
	//}

	//static makeLeftManeuvers ( junction: TvJunction, listA: JunctionEntryObject[], listB: JunctionEntryObject[] ) {
	//
	//	const inDescOrder = ( a, b ) => a.id > b.id ? -1 : 1;
	//	const inAscOrder = ( a, b ) => a.id > b.id ? 1 : -1;
	//
	//	const contactA = listA[ 0 ].contact;
	//	const finalA = listA
	//		.filter( e => contactA == TvContactPoint.END ? e.lane.isRight : e.lane.isLeft )
	//		.sort( contactA == TvContactPoint.END ? inDescOrder : inAscOrder );
	//
	//	const contactB = listB[ 0 ].contact;
	//	const finalB = listB
	//		.filter( e => contactB == TvContactPoint.START ? e.lane.isRight : e.lane.isLeft )
	//		.sort( contactB == TvContactPoint.START ? inAscOrder : inDescOrder );
	//
	//	for ( let i = 0; i < finalA.length; i++ ) {
	//
	//		const element = finalA[ i ];
	//
	//		if ( i < finalB.length ) {
	//
	//			const otherElement = finalB[ i ];
	//
	//			if ( !element.isLeftConnection( otherElement ) ) continue;
	//
	//			const entry = element.isEntry ? element : otherElement;
	//
	//			const exit = element.isExit ? element : otherElement;
	//
	//			if ( !entry.isLeftMost() ) continue;
	//
	//			this.connect( junction, entry, exit );
	//
	//		}
	//	}
	//
	//}

	// static mergeEntriesV3 ( junction: TvJunction, objects: JunctionEntryObject[] ) {
	//
	// 	const roads = this.groupEntriesByRoad( objects );
	// 	const keys = Array.from( roads.keys() );
	//
	// 	// straight connections
	// 	for ( let i = 0; i < objects.length; i++ ) {
	//
	// 		const left = objects[ i ];
	//
	// 		for ( let j = i + 1; j < objects.length; j++ ) {
	//
	// 			const right = objects[ j ];
	//
	// 			if ( left.canConnect( right ) && left.isStraightConnection( right ) ) {
	//
	// 				const entry = left.isEntry ? left : right;
	// 				const exit = left.isExit ? left : right;
	//
	// 				this.connect( junction, entry, exit );
	// 			}
	// 		}
	// 	}
	//
	// 	for ( let i = 0; i < keys.length; i++ ) {
	//
	// 		const road1 = roads.get( keys[ i ] );
	//
	// 		for ( let j = i + 1; j < keys.length; j++ ) {
	//
	// 			const road2 = roads.get( keys[ j ] );
	//
	// 			this.makeRightManeuvers( junction, road1, road2 );
	// 			this.makeRightManeuvers( junction, road2, road1 );
	//
	// 			this.makeLeftManeuvers( junction, road1, road2 );
	// 			this.makeLeftManeuvers( junction, road2, road1 );
	//
	// 		}
	// 	}
	//
	// }

	// static groupEntriesByRoad ( objects: JunctionEntryObject[] ): Map<number, JunctionEntryObject[]> {
	//
	// 	const roads = new Map<number, JunctionEntryObject[]>();
	//
	// 	objects.forEach( entry => {
	//
	// 		if ( !roads.has( entry.road.id ) ) {
	// 			roads.set( entry.road.id, [] );
	// 		}
	//
	// 		roads.get( entry.road.id ).push( entry );
	//
	// 	} );
	//
	// 	return roads;
	// }

	// static connect ( junction: TvJunction, entry: JunctionEntryObject, exit: JunctionEntryObject ) {
	//
	// 	if ( !junction ) {
	//
	// 		( new CreateSingleManeuver( null, entry, exit, junction, null, null ) ).execute();
	//
	// 	} else {
	//
	// 		const connection = junction.findRoadConnection( entry.road, exit.road );
	//
	// 		const laneLink = connection?.laneLink.find( i => i.from === entry.lane.id );
	//
	// 		if ( connection && laneLink ) {
	//
	// 			TvConsole.warn( 'Connection already exists' );
	//
	// 		} else {
	//
	// 			( new CreateSingleManeuver( null, entry, exit, junction, connection, laneLink ) ).execute();
	//
	// 		}
	//
	// 	}
	//
	// }

	// static makeRightManeuvers ( junction: TvJunction, listA: JunctionEntryObject[], listB: JunctionEntryObject[] ) {
	//
	// 	const inDescOrder = ( a, b ) => a.id > b.id ? -1 : 1;
	// 	const inAscOrder = ( a, b ) => a.id > b.id ? 1 : -1;
	//
	// 	const contactA = listA[ 0 ].contact;
	// 	const finalA = listA
	// 		.filter( e => contactA == TvContactPoint.END ? e.lane.isRight : e.lane.isLeft )
	// 		.sort( contactA == TvContactPoint.START ? inAscOrder : inDescOrder );
	//
	// 	const contactB = listB[ 0 ].contact;
	// 	const finalB = listB
	// 		.filter( e => contactB == TvContactPoint.END ? e.lane.isLeft : e.lane.isRight )
	// 		.sort( contactB == TvContactPoint.START ? inDescOrder : inAscOrder );
	//
	// 	for ( let i = 0; i < finalA.length; i++ ) {
	//
	// 		const element = finalA[ i ];
	//
	// 		if ( i < finalB.length ) {
	//
	// 			const otherElement = finalB[ i ];
	//
	// 			if ( !element.isRightConnection( otherElement ) ) continue;
	//
	// 			const entry = element.isEntry ? element : otherElement;
	//
	// 			const exit = element.isExit ? element : otherElement;
	//
	// 			if ( !entry.isRightMost() ) continue;
	//
	// 			this.connect( junction, entry, exit );
	//
	// 		}
	// 	}
	//
	// }

	// static makeLeftManeuvers ( junction: TvJunction, listA: JunctionEntryObject[], listB: JunctionEntryObject[] ) {
	//
	// 	const inDescOrder = ( a, b ) => a.id > b.id ? -1 : 1;
	// 	const inAscOrder = ( a, b ) => a.id > b.id ? 1 : -1;
	//
	// 	const contactA = listA[ 0 ].contact;
	// 	const finalA = listA
	// 		.filter( e => contactA == TvContactPoint.END ? e.lane.isRight : e.lane.isLeft )
	// 		.sort( contactA == TvContactPoint.END ? inDescOrder : inAscOrder );
	//
	// 	const contactB = listB[ 0 ].contact;
	// 	const finalB = listB
	// 		.filter( e => contactB == TvContactPoint.START ? e.lane.isRight : e.lane.isLeft )
	// 		.sort( contactB == TvContactPoint.START ? inAscOrder : inDescOrder );
	//
	// 	for ( let i = 0; i < finalA.length; i++ ) {
	//
	// 		const element = finalA[ i ];
	//
	// 		if ( i < finalB.length ) {
	//
	// 			const otherElement = finalB[ i ];
	//
	// 			if ( !element.isLeftConnection( otherElement ) ) continue;
	//
	// 			const entry = element.isEntry ? element : otherElement;
	//
	// 			const exit = element.isExit ? element : otherElement;
	//
	// 			if ( !entry.isLeftMost() ) continue;
	//
	// 			this.connect( junction, entry, exit );
	//
	// 		}
	// 	}
	//
	// }

	// static createRampRoad ( virtualJunction: TvVirtualJunction, startCoord: TvLaneCoord, endCoord: TvLaneCoord | Vector3 ) {

	// 	let v1, v2, v3, v4;

	// 	if ( endCoord instanceof TvLaneCoord ) {
	// 		[ v1, v2, v3, v4 ] = this.makeRampRoadPoints( startCoord.position, endCoord.position, startCoord.posTheta.toDirectionVector() );
	// 	} else if ( endCoord instanceof Vector3 ) {
	// 		[ v1, v2, v3, v4 ] = this.makeRampRoadPoints( startCoord.position, endCoord, startCoord.posTheta.toDirectionVector() );
	// 	}

	// 	const newLane = startCoord.lane.cloneAtS( -1, startCoord.s );

	// 	const rampRoad = RoadFactory.createRampRoad( newLane );

	// 	const connection = new TvJunctionConnection( virtualJunction.connections.size, startCoord.road, rampRoad, TvContactPoint.START, null );

	// 	connection.addLaneLink( new TvJunctionLaneLink( startCoord.lane, newLane ) );

	// 	virtualJunction.addConnection( connection );

	// 	rampRoad.junctionId = virtualJunction.id;

	// 	rampRoad.addControlPointAt( v1 );
	// 	rampRoad.addControlPointAt( v2 );
	// 	rampRoad.addControlPointAt( v3 );
	// 	rampRoad.addControlPointAt( v4 );

	// 	const startElevation = startCoord.road.getElevationValue( startCoord.s );
	// 	const endElevation = endCoord instanceof TvLaneCoord ? endCoord.road.getElevationValue( endCoord.s ) : endCoord.z;

	// 	rampRoad.addElevation( 0, startElevation + 0.1, 0, 0, 0 );
	// 	rampRoad.addElevationInstance( new TvElevation( rampRoad.length, endElevation + 0.1, 0, 0, 0 ) );

	// 	rampRoad.updateGeometryFromSpline();

	// 	// rampRoad.predecessor = new TvRoadLinkChild( TvRoadLinkChildType.road, startCoord.roadId, TvContactPoint.START );
	// 	// rampRoad.predecessor.elementDir = TvOrientation.PLUS;
	// 	// rampRoad.predecessor.elementS = startCoord.s;

	// 	return rampRoad;
	// }

	// static makeRampRoadPoints ( v1: Vector3, v4: Vector3, direction1: Vector3, direction4?: Vector3 ): Vector3[] {

	// 	// const direction = posTheta.toDirectionVector();
	// 	const normalizedDirection1 = direction1.clone().normalize();
	// 	const normalizedDirection4 = direction4 ? direction4.clone().normalize() : direction1.clone().normalize();

	// 	const upVector = new Vector3( 0, 0, 1 );
	// 	const perpendicular1 = normalizedDirection1.clone().cross( upVector );
	// 	const perpendicular4 = normalizedDirection4.clone().cross( upVector );

	// 	const distanceAB = v1.distanceTo( v4 );

	// 	const v2 = v1.clone().add( normalizedDirection1.clone().multiplyScalar( distanceAB / 3 ) );
	// 	const v3 = v4.clone().add( perpendicular1.clone().multiplyScalar( -distanceAB / 3 ) );

	// 	return [ v1, v2, v3, v4 ];
	// }

	// static makeRampSpline ( v1: Vector3, v4: Vector3, direction1: Vector3, direction4?: Vector3 ) {

	// 	// const direction = posTheta.toDirectionVector();
	// 	const normalizedDirection1 = direction1.clone().normalize();
	// 	const normalizedDirection4 = direction4 ? direction4.clone().normalize() : direction1.clone().normalize();

	// 	const upVector = new Vector3( 0, 0, 1 );
	// 	const perpendicular1 = normalizedDirection1.clone().cross( upVector );
	// 	const perpendicular4 = normalizedDirection4.clone().cross( upVector );

	// 	const distanceAB = v1.distanceTo( v4 );

	// 	const v2 = v1.clone().add( normalizedDirection1.clone().multiplyScalar( distanceAB / 3 ) );
	// 	const v3 = v4.clone().add( perpendicular1.clone().multiplyScalar( -distanceAB / 3 ) );

	// 	const spline = new AutoSpline();

	// 	spline.addControlPointAt( v1 );
	// 	spline.addControlPointAt( v2 );
	// 	spline.addControlPointAt( v3 );
	// 	spline.addControlPointAt( v4 );

	// 	return spline;
	// }

	// static updateRampSpline ( spline: AutoSpline, v1: Vector3, v4: Vector3, direction1: Vector3, direction4?: Vector3 ) {

	// 	// const direction = posTheta.toDirectionVector();
	// 	const normalizedDirection1 = direction1.clone().normalize();
	// 	const normalizedDirection4 = direction4 ? direction4.clone().normalize() : direction1.clone().normalize();

	// 	const upVector = new Vector3( 0, 0, 1 );
	// 	const perpendicular1 = normalizedDirection1.clone().cross( upVector );
	// 	const perpendicular4 = normalizedDirection4.clone().cross( upVector );

	// 	const distanceAB = v1.distanceTo( v4 );

	// 	const v2 = v1.clone().add( normalizedDirection1.clone().multiplyScalar( distanceAB / 3 ) );
	// 	const v3 = v4.clone().add( perpendicular1.clone().multiplyScalar( -distanceAB / 3 ) );

	// 	spline.getSecondPoint().position.copy( v2 );
	// 	spline.getSecondLastPoint().position.copy( v3 );

	// 	return spline;
	// }

	// static makeRampRoadPoints ( startCoord: TvLaneCoord | Vector3, endCoord: TvLaneCoord | Vector3 ): Vector3[] {

	// 	let v1: Vector3, v4: Vector3;

	// 	let directionV1: Vector3, directionV4: Vector3;

	// 	// Normalize the direction vectors to ensure they have a unit length
	// 	// const normalizedDirectionV1 = directionV1.clone().normalize();
	// 	// const normalizedDirectionV4 = directionV4.clone().normalize();

	// 	if ( startCoord instanceof TvLaneCoord ) {

	// 		v1 = startCoord.position;
	// 		directionV1 = startCoord.posTheta.toDirectionVector().clone().normalize();

	// 	} else if ( startCoord instanceof Vector3 ) {

	// 		v1 = startCoord;
	// 		directionV1 = new Vector3( 0, 0, 1 );

	// 	}

	// 	if ( endCoord instanceof TvLaneCoord ) {

	// 		v4 = endCoord.position;
	// 		directionV4 = endCoord.posTheta.toDirectionVector().clone().normalize();

	// 	} else if ( endCoord instanceof Vector3 ) {

	// 		v4 = endCoord;
	// 		directionV4 = new Vector3( 0, 0, 1 );

	// 	}

	// 	// Define the up vector representing the Z-axis.
	// 	const upVector = new Vector3( 0, 0, 1 );
	// 	// Calculate a vector perpendicular to the direction of V1.
	// 	const perpendicular = directionV4.clone().cross( upVector );

	// 	// Calculate the distance between the starting point v1 and the ending point v4.
	// 	const distanceAB = v1.distanceTo( v4 );

	// 	// Calculate the intermediate points v2 and v3. These points are crucial for the curvature of the ramp.
	// 	// v2 is calculated using the direction of v1
	// 	// const v2 = v1.clone().multiplyScalar( distanceAB / 3 ) );

	// 	const v2 = v1.clone().add( directionV1.clone().multiplyScalar( distanceAB / 3 ) );
	// 	const v3 = v4.clone().add( perpendicular.clone().multiplyScalar( -distanceAB / 3 ) );

	// 	// v3 is calculated using the direction of v4, which is the new part compared to the original function.
	// 	// This ensures that the curve respects the direction in which v4 is supposed to point.
	// 	// const v3 = v4.clone().add( directionV4.clone().multiplyScalar( -distanceAB / 3 ) );

	// 	// Return the four control points that will be used to form the Bezier curve of the ramp.
	// 	return [ v1, v2, v3, v4 ];
	// }

}
