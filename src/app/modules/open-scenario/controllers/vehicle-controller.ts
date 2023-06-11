import { TvMap } from '../../tv-map/models/tv-map.model';
import { OscEntityObject } from '../models/osc-entities';
import { TvLane } from '../../tv-map/models/tv-lane';
import { TvRoad } from '../../tv-map/models/tv-road.model';
import { OscSourceFile } from '../services/osc-source-file';
import { TvContactPoint } from '../../tv-map/models/tv-common';
import { TvPosTheta } from '../../tv-map/models/tv-pos-theta';
import { Maths } from '../../../utils/maths';
import { AbstractController } from '../models/osc-interfaces';
import { OscPlayerService } from '../services/osc-player.service';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { Time } from '../../../core/time';

export class DefaultVehicleController extends AbstractController {

	constructor ( private openDrive: TvMap, private entity: OscEntityObject ) {
		super();
	}

	private get actor () {

		return this.entity;

	}

	static getSuccessorRoad ( currentRoad: TvRoad, openDrive: TvMap ) {

		let nextRoad: TvRoad;

		const successor = currentRoad.successor;

		if ( successor.elementType == 'road' ) {

			nextRoad = openDrive.getRoadById( successor.elementId );

		} else if ( successor.elementType == 'junction' ) {

			const junction = openDrive.getJunctionById( successor.elementId );
			const connection = junction.getRandomConnectionFor( currentRoad.id );

			nextRoad = openDrive.getRoadById( connection.connectingRoad );
		}

		return nextRoad;
	}

	public update () {

		const actor = this.actor;
		const roads = this.openDrive.roads;

		const currentRoad = roads.get( actor.roadId );
		const currentLaneSection = currentRoad.getLaneSectionById( actor.laneSectionId );
		const currentLaneId = actor.laneId;
		const currentLane = currentLaneSection.getLaneById( currentLaneId );

		let nextLaneId: number;
		let nextLane: TvLane;
		let nextRoad: TvRoad;

		this.followFrontVehicle( actor );

		if ( actor.sCoordinate > currentRoad.length ) {

			if ( actor.direction > 0 ) {

				const successor = currentRoad.successor;

				if ( !successor ) {

					actor.disable();

				} else {

					const contactPoint = successor.contactPoint;

					// find road
					if ( successor.elementType == 'road' ) {

						nextRoad = this.openDrive.getRoadById( successor.elementId );
						nextLaneId = currentLane.successorExists ? currentLane.succcessor : currentLane.id;

					} else if ( successor.elementType == 'junction' ) {

						const junction = this.openDrive.getJunctionById( successor.elementId );
						const connection = junction.getRandomConnectionFor( currentRoad.id, currentLaneId );

						nextRoad = this.openDrive.getRoadById( connection.connectingRoad );
						nextLaneId = connection.getToLaneId( currentLaneId );
					}

					// update s-coordinate
					if ( contactPoint === TvContactPoint.END ) {

						actor.direction = -1;
						actor.sCoordinate = nextRoad.length - ( actor.sCoordinate - currentRoad.length );

					} else {

						actor.direction = 1;
						actor.sCoordinate = actor.sCoordinate - currentRoad.length;

					}

					// find laneSection
					const nextLaneSection = nextRoad.getLaneSectionAt( actor.sCoordinate );

					// find lane
					nextLane = nextLaneSection.getLaneById( nextLaneId );

					// console.info( currentRoad, currentLaneSection, currentLane, actor );
					// console.info( nextRoad, nextLaneSection, nextLane, nextLaneId );

					actor.roadId = nextRoad.id;
					actor.laneSectionId = nextLaneSection.id;
					actor.laneId = nextLane.id;

				}

			}

		} else if ( actor.sCoordinate < 0 ) {

			const predecessor = currentRoad.predecessor;

			if ( !predecessor ) {

				actor.disable();

			} else {

				const contactPoint = predecessor.contactPoint;

				// find road
				if ( predecessor.elementType == 'road' ) {

					nextRoad = this.openDrive.getRoadById( predecessor.elementId );
					nextLaneId = currentLane.predecessorExists ? currentLane.predecessor : currentLane.id;

				} else if ( predecessor.elementType == 'junction' ) {

					const junction = this.openDrive.getJunctionById( predecessor.elementId );
					const connection = junction.getRandomConnectionFor( currentRoad.id, currentLaneId );

					nextRoad = this.openDrive.getRoadById( connection.connectingRoad );
					nextLaneId = connection.getToLaneId( currentLaneId );
				}

				// update s-coordinate
				if ( contactPoint === TvContactPoint.END ) {

					actor.direction = -1;
					actor.sCoordinate = nextRoad.length + actor.sCoordinate;

				} else {

					actor.direction = 1;
					actor.sCoordinate = -1 * actor.sCoordinate;

				}

				// find laneSection
				const nextLaneSection = nextRoad.getLaneSectionAt( actor.sCoordinate );

				try {

					nextLane = nextLaneSection.getLaneById( nextLaneId );

					actor.roadId = nextRoad.id;
					actor.laneSectionId = nextLaneSection.id;
					actor.laneId = nextLane.id;

				} catch ( e ) {

					console.error( e );
					console.info( currentRoad, currentLaneSection, currentLane, actor );
					console.info( nextRoad, nextLaneSection, nextLane, nextLaneId );

				}

				// console.info( currentRoad, currentLaneSection, currentLane, actor );
				// console.info( nextRoad, nextLaneSection, nextLane, nextLaneId );
			}

		} else {

			// positive direction
			if ( actor.direction > 0 && actor.sCoordinate > currentLaneSection.endS ) {

				actor.laneSectionId += 1;
				actor.laneId = currentLane.getSuccessor();

			} else if ( actor.direction < 0 && actor.sCoordinate < currentLaneSection.s ) {

				actor.laneSectionId -= 1;
				actor.laneId = currentLane.getPredecessor();

			} else {

				// console.warn( 'uknown situation' );

			}

			const refPos = new TvPosTheta();

			const position = TvMapQueries.getLanePosition( actor.roadId, actor.laneId, actor.sCoordinate, actor.laneOffset, refPos );

			actor.gameObject.position.copy( position );

			// right lane move forward
			// left lane traffic move opposite
			// actor.direction = obj.getLaneId() > 0 ? -1 : 1;

			actor.gameObject.rotation.set( 0, 0, refPos.hdg - Maths.M_PI_2 );

			actor.sCoordinate += actor.speed * actor.direction * Maths.Speed2MPH * Time.deltaTime;
		}

	}

	private followFrontVehicle ( actor: OscEntityObject ) {

		// my current road s + 10
		//

		// const vehiclesInFront = this.getVehiclesInFront( actor );

		const entityInFront = [ ...OscSourceFile.openScenario.objects.values() ].find( otherActor => {
			if (
				otherActor.roadId == actor.roadId &&
				otherActor.laneSectionId == actor.laneSectionId &&
				otherActor.laneId == actor.laneId &&
				otherActor.name != actor.name
			) {

				let distance: number = 0;

				if ( actor.direction > 0 ) {

					distance = ( otherActor.sCoordinate - actor.sCoordinate );


				} else {

					distance = ( actor.sCoordinate - otherActor.sCoordinate );

				}

				const inFront = distance > 0;

				if ( inFront && distance <= 10 && otherActor.speed < actor.speed ) {

					actor.speed = otherActor.speed;
					return true;

				}

				return false;

			}
		} );

		// if ( entityInFront.length > 0 ) {
		//
		//     // console.log( 'entity-in-front', actor, entityInFront );
		//     if ( actor.speed != entityInFront[ 0 ].speed ) {
		//
		//         const ttc = Math.abs( actor.sCoordinate - entityInFront[ 0 ].sCoordinate );
		//         const action = new OscSpeedAction( new OscSpeedDynamics( OscDynamicsShape.linear, 1 ), new OscAbsoluteTarget( entityInFront[ 0 ].speed ) );
		//
		//         action.execute( actor as OscEntityObject );
		//
		//     }
		//
		// } else {
		//
		//     if ( actor.speed != actor.desiredSpeed ) {
		//
		//         const ttc = Math.abs( actor.sCoordinate - entityInFront[ 0 ].sCoordinate );
		//         const action = new OscSpeedAction( new OscSpeedDynamics( OscDynamicsShape.linear, 1 ), new OscAbsoluteTarget( actor.desiredSpeed ) );
		//
		//         action.execute( actor as OscEntityObject );
		//
		//     }
		//
		// }

		if ( !entityInFront ) {

			const road = this.openDrive.roads.get( actor.roadId );
			const maxSpeed = road.findMaxSpeedAt( actor.sCoordinate );

			const desiredSpeed = Math.min( maxSpeed, actor.maxSpeed );

			if ( desiredSpeed == 0 ) {

				actor.speed = desiredSpeed;

			} else if ( actor.speed < desiredSpeed ) {

				actor.speed += 0.1;

			}

		} else {

			// console.log( 'vehicle-in-front' );

		}

	}

	private getVehiclesInFront ( actor: OscEntityObject ) {

		const currentRoad = this.openDrive.getRoadById( actor.roadId );

		let nextRoad: TvRoad;

		if ( actor.direction > 0 && currentRoad.successor ) {

			nextRoad = DefaultVehicleController.getSuccessorRoad( currentRoad, this.openDrive );

		} else if ( actor.direction < 0 && currentRoad.predecessor ) {


		}

		const vehicles: OscEntityObject[] = [];

		OscPlayerService.traffic.get( currentRoad.id ).forEach( item => vehicles.push( item ) );

		if ( nextRoad ) {

			OscPlayerService.traffic.get( nextRoad.id ).forEach( item => vehicles.push( item ) );

		}

		const nextVehicle = vehicles.find( otherActor => {

			let distance: number = 0;

			if ( actor.direction > 0 ) {

				distance = ( otherActor.sCoordinate - actor.sCoordinate );


			} else {

				distance = ( actor.sCoordinate - otherActor.sCoordinate );

			}

			const inFront = distance > 0;

			if ( inFront && distance <= 5 ) {

				actor.speed = otherActor.speed;
				return true;

			} else if ( inFront && distance <= 10 ) {

				actor.speed = otherActor.speed;
				return true;

			}

			return false;

		} );
	}
}

