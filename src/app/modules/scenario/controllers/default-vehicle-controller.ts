/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../core/time';
import { TvConsole } from '../../../core/utils/console';
import { Maths } from '../../../utils/maths';
import { TvContactPoint } from '../../tv-map/models/tv-common';
import { TvLane } from '../../tv-map/models/tv-lane';
import { TvMap } from '../../tv-map/models/tv-map.model';
import { TvPosTheta } from '../../tv-map/models/tv-pos-theta';
import { TvRoad } from '../../tv-map/models/tv-road.model';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { AbstractController } from '../models/abstract-controller';
import { ScenarioEntity } from '../models/entities/scenario-entity';

export class DefaultVehicleController extends AbstractController {

	constructor ( name = 'DefaultVehicleController', private entity: ScenarioEntity ) {
		super( name );
	}

	static getSuccessorRoad ( currentRoad: TvRoad, map: TvMap ) {

		let nextRoad: TvRoad;

		const successor = currentRoad.successor;

		if ( successor.elementType == 'road' ) {

			nextRoad = map.getRoadById( successor.elementId );

		} else if ( successor.elementType == 'junction' ) {

			const junction = map.getJunctionById( successor.elementId );
			const connection = junction.getRandomConnectionFor( currentRoad.id );

			nextRoad = connection.connectingRoad;
		}

		return nextRoad;
	}

	public update () {

		if ( !this.entity.openDriveProperties.isOpenDrive ) {
			TvConsole.warn( this.entity.name + ` is not OpenDrive entity` );
			return;
		}

		const entity = this.entity;
		const roads = this.map.roads;

		const currentRoad = roads.get( entity.roadId );
		const currentLaneSection = currentRoad.getLaneSectionById( entity.laneSectionId );
		const currentLaneId = entity.laneId;
		const currentLane = currentLaneSection.getLaneById( currentLaneId );

		let nextLaneId: number;
		let nextLane: TvLane;
		let nextRoad: TvRoad;

		// we want dummy
		// not smart moves
		// for smart moved we will use another controller
		// this.followFrontVehicle( actor );

		if ( entity.sCoordinate > currentRoad.length ) {

			if ( entity.direction > 0 ) {

				const successor = currentRoad.successor;

				if ( !successor ) {

					entity.disable();

				} else {

					let contactPoint = successor.contactPoint;

					// find road
					if ( successor.elementType == 'road' ) {

						nextRoad = this.map.getRoadById( successor.elementId );
						nextLaneId = currentLane.successorExists ? currentLane.succcessor : currentLane.id;

					} else if ( successor.elementType == 'junction' ) {

						const junction = this.map.getJunctionById( successor.elementId );
						const connection = junction.getRandomConnectionFor( currentRoad.id, currentLaneId );

						contactPoint = connection.contactPoint;

						nextRoad = connection.connectingRoad;
						nextLaneId = connection.getToLaneId( currentLaneId );
					}

					// update s-coordinate
					if ( contactPoint === TvContactPoint.END ) {

						entity.setTravelingDirection( -1 );
						entity.setSValue( nextRoad.length - ( entity.sCoordinate - currentRoad.length ) );

					} else {

						entity.setTravelingDirection( 1 );

						// const roadCoord = new TvPosTheta();
						// const res = TvMapQueries.getRoadByCoords( entity.position.x, entity.position.y, roadCoord, currentRoad );
						entity.setSValue( entity.sCoordinate - currentRoad.length );
						// entity.setSValue( 0 );
					}

					// find laneSection
					const nextLaneSection = nextRoad.getLaneSectionAt( entity.sCoordinate );

					// find lane
					nextLane = nextLaneSection.getLaneById( nextLaneId );

					// console.info( currentRoad, currentLaneSection, currentLane, actor );
					// console.info( nextRoad, nextLaneSection, nextLane, nextLaneId );

					entity.roadId = nextRoad.id;
					entity.laneSectionId = nextLaneSection.id;
					entity.laneId = nextLane.id;

				}

			}

		} else if ( entity.sCoordinate < 0 ) {

			const predecessor = currentRoad.predecessor;

			if ( !predecessor ) {

				entity.disable();

			} else {

				let contactPoint = predecessor.contactPoint;

				// find road
				if ( predecessor.elementType == 'road' ) {

					nextRoad = this.map.getRoadById( predecessor.elementId );
					nextLaneId = currentLane.predecessorExists ? currentLane.predecessor : currentLane.id;

				} else if ( predecessor.elementType == 'junction' ) {

					const junction = this.map.getJunctionById( predecessor.elementId );
					const connection = junction.getRandomConnectionFor( currentRoad.id, currentLaneId );

					contactPoint = connection.contactPoint;

					nextRoad = connection.connectingRoad;
					nextLaneId = connection.getToLaneId( currentLaneId );
				}

				// update s-coordinate
				if ( contactPoint === TvContactPoint.END ) {

					entity.direction = -1;
					entity.sCoordinate = nextRoad.length + entity.sCoordinate;

				} else {

					entity.direction = 1;
					entity.sCoordinate = -1 * entity.sCoordinate;

				}

				// find laneSection
				const nextLaneSection = nextRoad.getLaneSectionAt( entity.sCoordinate );

				try {

					nextLane = nextLaneSection.getLaneById( nextLaneId );

					entity.roadId = nextRoad.id;
					entity.laneSectionId = nextLaneSection.id;
					entity.laneId = nextLane.id;

				} catch ( e ) {

					console.error( e );
					console.info( currentRoad, currentLaneSection, currentLane, entity );
					console.info( nextRoad, nextLaneSection, nextLane, nextLaneId );

				}

				// console.info( currentRoad, currentLaneSection, currentLane, actor );
				// console.info( nextRoad, nextLaneSection, nextLane, nextLaneId );
			}

		} else {

			// positive direction
			if ( entity.direction > 0 && entity.sCoordinate > currentLaneSection.endS ) {

				entity.laneSectionId += 1;
				entity.laneId = currentLane.getSuccessor();

			} else if ( entity.direction < 0 && entity.sCoordinate < currentLaneSection.s ) {

				entity.laneSectionId -= 1;
				entity.laneId = currentLane.getPredecessor();

			} else {

				// console.warn( 'uknown situation' );

			}

			const refPos = new TvPosTheta();

			const position = TvMapQueries.getLaneCenterPosition( entity.roadId, entity.laneId, entity.sCoordinate, entity.laneOffset, refPos );

			entity.position.copy( position );

			// right lane move forward
			// left lane traffic move opposite
			// actor.direction = obj.getLaneId() > 0 ? -1 : 1;

			entity.rotation.set( 0, 0, refPos.hdg - Maths.PI2 );

			entity.sCoordinate += entity.speed * entity.direction * Maths.Speed2MPH * Time.deltaTime;
		}

	}

	// private followFrontVehicle ( actor: EntityObject ) {
	//
	// 	// my current road s + 10
	// 	//
	//
	// 	// const vehiclesInFront = this.getVehiclesInFront( actor );
	//
	// 	const entityInFront = [ ...TvScenarioInstance.openScenario.objects.values() ].find( otherActor => {
	// 		if (
	// 			otherActor.roadId == actor.roadId &&
	// 			otherActor.laneSectionId == actor.laneSectionId &&
	// 			otherActor.laneId == actor.laneId &&
	// 			otherActor.name != actor.name
	// 		) {
	//
	// 			let distance: number = 0;
	//
	// 			if ( actor.direction > 0 ) {
	//
	// 				distance = ( otherActor.sCoordinate - actor.sCoordinate );
	//
	//
	// 			} else {
	//
	// 				distance = ( actor.sCoordinate - otherActor.sCoordinate );
	//
	// 			}
	//
	// 			const inFront = distance > 0;
	//
	// 			if ( inFront && distance <= 10 && otherActor.speed < actor.speed ) {
	//
	// 				actor.speed = otherActor.speed;
	// 				return true;
	//
	// 			}
	//
	// 			return false;
	//
	// 		}
	// 	} );
	//
	// 	// if ( entityInFront.length > 0 ) {
	// 	//
	// 	//     // console.log( 'entity-in-front', actor, entityInFront );
	// 	//     if ( actor.speed != entityInFront[ 0 ].speed ) {
	// 	//
	// 	//         const ttc = Math.abs( actor.sCoordinate - entityInFront[ 0 ].sCoordinate );
	// 	//         const action = new SpeedAction( new SpeedDynamics( DynamicsShape.linear, 1 ), new AbsoluteTarget( entityInFront[ 0 ].speed ) );
	// 	//
	// 	//         action.execute( actor as EntityObject );
	// 	//
	// 	//     }
	// 	//
	// 	// } else {
	// 	//
	// 	//     if ( actor.speed != actor.desiredSpeed ) {
	// 	//
	// 	//         const ttc = Math.abs( actor.sCoordinate - entityInFront[ 0 ].sCoordinate );
	// 	//         const action = new SpeedAction( new SpeedDynamics( DynamicsShape.linear, 1 ), new AbsoluteTarget( actor.desiredSpeed ) );
	// 	//
	// 	//         action.execute( actor as EntityObject );
	// 	//
	// 	//     }
	// 	//
	// 	// }
	//
	// 	if ( !entityInFront ) {
	//
	// 		const road = this.openDrive.roads.get( actor.roadId );
	// 		const maxSpeed = road.findMaxSpeedAt( actor.sCoordinate );
	//
	// 		const desiredSpeed = Math.min( maxSpeed, actor.maxSpeed );
	//
	// 		if ( desiredSpeed == 0 ) {
	//
	// 			actor.speed = desiredSpeed;
	//
	// 		} else if ( actor.speed < desiredSpeed ) {
	//
	// 			actor.speed += 0.1;
	//
	// 		}
	//
	// 	} else {
	//
	// 		// console.log( 'vehicle-in-front' );
	//
	// 	}
	//
	// }
	//
	// private getVehiclesInFront ( actor: EntityObject ) {
	//
	// 	const currentRoad = this.openDrive.getRoadById( actor.roadId );
	//
	// 	let nextRoad: TvRoad;
	//
	// 	if ( actor.direction > 0 && currentRoad.successor ) {
	//
	// 		nextRoad = DefaultVehicleController.getSuccessorRoad( currentRoad, this.openDrive );
	//
	// 	} else if ( actor.direction < 0 && currentRoad.predecessor ) {
	//
	//
	// 	}
	//
	// 	const vehicles: EntityObject[] = [];
	//
	// 	ScenarioDirectorService.traffic.get( currentRoad.id ).forEach( item => vehicles.push( item ) );
	//
	// 	if ( nextRoad ) {
	//
	// 		ScenarioDirectorService.traffic.get( nextRoad.id ).forEach( item => vehicles.push( item ) );
	//
	// 	}
	//
	// 	const nextVehicle = vehicles.find( otherActor => {
	//
	// 		let distance: number = 0;
	//
	// 		if ( actor.direction > 0 ) {
	//
	// 			distance = ( otherActor.sCoordinate - actor.sCoordinate );
	//
	//
	// 		} else {
	//
	// 			distance = ( actor.sCoordinate - otherActor.sCoordinate );
	//
	// 		}
	//
	// 		const inFront = distance > 0;
	//
	// 		if ( inFront && distance <= 5 ) {
	//
	// 			actor.speed = otherActor.speed;
	// 			return true;
	//
	// 		} else if ( inFront && distance <= 10 ) {
	//
	// 			actor.speed = otherActor.speed;
	// 			return true;
	//
	// 		}
	//
	// 		return false;
	//
	// 	} );
	// }
}

