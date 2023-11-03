import { MapEvents, RoadUpdatedEvent } from "app/events/map-events";
import { TvMapBuilder } from "app/modules/tv-map/builders/tv-map-builder";
import { TvLaneSide, TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { TvPosTheta } from "app/modules/tv-map/models/tv-pos-theta";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvMapInstance } from "app/modules/tv-map/services/tv-map-instance";
import { Manager } from "./manager";
import { TvJunction, TvVirtualJunction } from "app/modules/tv-map/models/tv-junction";
import { JunctionFactory } from "../factories/junction.factory";
import { Vector3 } from "three";
import { RoadFactory } from "app/factories/road-factory.service";

interface TempIntersection {
	x: number,
	y: number,
	coordA?: TvRoadCoord,
	coordB?: TvRoadCoord,
}

export class JunctionManager extends Manager {

	private static _instance = new JunctionManager();

	static get instance (): JunctionManager {
		return this._instance;
	}

	constructor () {

		super();

	}

	init () {

		MapEvents.roadUpdated.subscribe( event => this.onRoadUpdated( event ) );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ): void {

		console.log( 'onRoadUpdated', event.road );

		const virtualJunction = this.getConnectedJunctions( event.road );

		if ( virtualJunction ) {
			this.updateVirtualJunction( event.road, virtualJunction as TvVirtualJunction );
		}

		const intersections = this.findIntersectionsSlow( event.road );

		if ( intersections.length === 0 ) {

			// if road previously has intersection, we need to remove it
			if ( this.getJunctionSection( event.road ) ) {

				this.removeJunctionSection( event.road );

			}


		} else if ( intersections.length === 1 ) {

			// check if the intersection is already present in the map
			const intersection = intersections[ 0 ];

			const roadAInterSection = this.getJunctionSection( intersection.coordA.road );
			const roadBInterSection = this.getJunctionSection( intersection.coordB.road );

			if ( roadAInterSection && roadBInterSection ) {

				this.updateJunction( intersection );

			} else {

				this.createJunction( intersection );

			}

			console.log( intersection.coordA.road.laneSections.length, intersection.coordB.road.laneSections.length );
		}

	}

	updateVirtualJunction ( mainRoad: TvRoad, junction: TvVirtualJunction ) {

		console.log( 'updating virtual junction', junction );

		const startCoord = mainRoad.getPositionAt( junction.sStart );
		const endCoord = mainRoad.getPositionAt( junction.sEnd );

		junction.connections.forEach( ( connection, connectionId ) => {

			const road = this.map.getRoadById( connection.connectingRoadId );

			const p1 = road.spline.getFirstPoint();
			const p2 = road.spline.getSecondPoint();
			const p4 = road.spline.getLastPoint();

			p1.setPosition( startCoord.toVector3() );

			const normalizedDirection = startCoord.toDirectionVector().normalize();

			const distanceAB = p1.position.distanceTo( p4.position );

			const v2 = p1.position.clone().add( normalizedDirection.clone().multiplyScalar( distanceAB / 3 ) );

			p2.setPosition( v2 );

			road.updateGeometryFromSpline();

			MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road, false ) );

		} );

	}

	private removeJunctionSection ( road: TvRoad ) {

		const junctionSection = this.getJunctionSection( road );

		if ( !junctionSection ) return;

		const junctionSectionIndex = road.laneSections.indexOf( junctionSection );

		const nextLaneSection = road.laneSections[ junctionSectionIndex + 1 ];

		if ( !nextLaneSection ) return;

		const nextLaneSectionIndex = road.laneSections.indexOf( nextLaneSection );

		road.laneSections.splice( nextLaneSectionIndex, 1 );

		road.laneSections.splice( junctionSectionIndex, 1 );

		road.computeLaneSectionCoordinates();

		TvMapBuilder.rebuildRoad( road, false );

	}

	private updateJunction ( intersection: TempIntersection ) {

		console.log( 'update intersection', intersection );

		// const roadAInterSection = intersection.coordA.road.laneSections.find( ls => ls.lanes.size <= 1 );
		// const roadBInterSection = intersection.coordB.road.laneSections.find( ls => ls.lanes.size <= 1 );

		// const roadAWidth = intersection.coordA.road.getRoadWidthAt( intersection.coordA.s );
		// const roadBWidth = intersection.coordB.road.getRoadWidthAt( intersection.coordB.s );

		// const roadANextLaneSection = intersection.coordA.road.laneSections.find( ls => ls.s > roadAInterSection.s );
		// const roadBNextLaneSection = intersection.coordB.road.laneSections.find( ls => ls.s > roadBInterSection.s );

		// if ( !roadANextLaneSection || !roadBNextLaneSection ) {
		// 	console.error( roadANextLaneSection, roadBNextLaneSection );
		// 	return;
		// }

		// roadAInterSection.attr_s = intersection.coordA.s - ( roadBWidth.totalWidth / 2 );
		// roadBInterSection.attr_s = intersection.coordB.s - ( roadAWidth.totalWidth / 2 );

		// roadANextLaneSection.attr_s = intersection.coordA.s + ( roadBWidth.totalWidth / 2 );
		// roadBNextLaneSection.attr_s = intersection.coordB.s + ( roadAWidth.totalWidth / 2 );

		// intersection.coordA.road.computeLaneSectionCoordinates();
		// intersection.coordB.road.computeLaneSectionCoordinates();

		// TvMapInstance.map.gameObject.remove( intersection.coordA.road.gameObject );
		// TvMapInstance.map.gameObject.remove( intersection.coordB.road.gameObject );

		const roadAWidth = intersection.coordA.road.getRoadWidthAt( intersection.coordA.s );
		const roadBWidth = intersection.coordB.road.getRoadWidthAt( intersection.coordB.s );

		// intersection.coordA.road
		// 	.duplicateLaneSectionAt( intersection.coordA.s + ( roadBWidth.totalWidth / 2 ) )
		// 	.deleteLeftLane()
		// 	.deleteRightLane();

		// intersection.coordB.road
		// 	.duplicateLaneSectionAt( intersection.coordB.s + ( roadAWidth.totalWidth / 2 ) )
		// 	.deleteLeftLane()
		// 	.deleteRightLane();

		// this.makeEmptyLaneSection( intersection.coordA.road.addGetLaneSection( intersection.coordA.s - ( roadBWidth.totalWidth / 2 ) ) );
		// this.makeEmptyLaneSection( intersection.coordB.road.addGetLaneSection( intersection.coordB.s - ( roadAWidth.totalWidth / 2 ) ) );

		// console.log(intersection.coordA.road.laneSections, intersection.coordB.road.laneSections);

		// intersection.coordA.road.splineStart = intersection.coordA.s + ( roadBWidth.totalWidth / 2 );
		// intersection.coordB.road.length = intersection.coordB.s - ( roadAWidth.totalWidth / 2 );

		TvMapBuilder.rebuildRoad( intersection.coordA.road, false );
		TvMapBuilder.rebuildRoad( intersection.coordB.road, false );
	}

	private createJunction ( intersection: TempIntersection ) {

		console.log( 'create intersection', intersection );

		const roadAWidth = intersection.coordA.road.getRoadWidthAt( intersection.coordA.s );
		const roadBWidth = intersection.coordB.road.getRoadWidthAt( intersection.coordB.s );

		// intersection.coordA.road
		// 	.duplicateLaneSectionAt( intersection.coordA.s + ( roadBWidth.totalWidth / 2 ) )
		// 	.deleteLeftLane()
		// 	.deleteRightLane();

		// intersection.coordB.road
		// 	.duplicateLaneSectionAt( intersection.coordB.s + ( roadAWidth.totalWidth / 2 ) )
		// 	.deleteLeftLane()
		// 	.deleteRightLane();

		// this.makeEmptyLaneSection( intersection.coordA.road.addGetLaneSection( intersection.coordA.s - ( roadBWidth.totalWidth / 2 ) ) );
		// this.makeEmptyLaneSection( intersection.coordB.road.addGetLaneSection( intersection.coordB.s - ( roadAWidth.totalWidth / 2 ) ) );

		// console.log(intersection.coordA.road.laneSections, intersection.coordB.road.laneSections);

		// const roadACopy = RoadFactory.cutRoad( intersection.coordA.road, intersection.coordA.s + ( roadBWidth.totalWidth / 2 ) );
		// const roadBCopy = RoadFactory.cloneRoad( intersection.coordB.road, intersection.coordB.s );

		// intersection.coordA.road.splineStart = intersection.coordA.s + ( roadBWidth.totalWidth / 2 );
		// intersection.coordB.road.splineEnd = intersection.coordB.s - ( roadAWidth.totalWidth / 2 );

		// TvMapInstance.map.addRoad( roadACopy );
		// TvMapBuilder.rebuildRoad( roadACopy, false );

		// TvMapBuilder.rebuildRoad( intersection.coordA.road, false );
		// TvMapBuilder.rebuildRoad( intersection.coordB.road, false );
	}

	private makeEmptyLaneSection ( lanesection: TvLaneSection ) {

		lanesection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, true, true );

	}

	private findIntersectionsSlow ( road: TvRoad ): TempIntersection[] {

		const step = 1;

		const pointCache: any[] = [];

		// const t1 = performance.now();

		const otherRoads = TvMapInstance.map.getRoads();

		for ( let i = 0; i < otherRoads.length; i++ ) {

			const road = otherRoads[ i ];

			const positions: any[] = [];

			const geom = {
				road: road.id,
				positions: positions,
			};

			const geometries = road.geometries;

			for ( let g = 0; g < geometries.length; g++ ) {

				const geometry = geometries[ g ];

				let posTheta = new TvPosTheta();

				for ( let s = geometry.s; s <= geometry.endS; s += step ) {

					posTheta = geometry.getRoadCoord( s );

					positions.push( { x: posTheta.x, y: posTheta.y, z: posTheta.z, s: s } );

				}
			}

			pointCache.push( geom );
		}

		// const t2 = performance.now();

		// const timeToMakeGeometries = t2 - t1; console.log( "step-1", timeToMakeGeometries );

		const intersections: TempIntersection[] = [];

		for ( let i = 0; i < pointCache.length; i++ ) {

			const points = pointCache[ i ].positions;

			for ( let j = i + 1; j < pointCache.length; j++ ) {

				const otherPoints = pointCache[ j ].positions;

				for ( let k = 0; k < otherPoints.length; k++ ) {

					const otherPoint = otherPoints[ k ];

					for ( let l = 0; l < points.length; l++ ) {

						const point = points[ l ];

						// const distance = position.distanceTo( otherPosition );

						const distance = Math.sqrt(
							( point.x - otherPoint.x ) * ( point.x - otherPoint.x ) +
							( point.y - otherPoint.y ) * ( point.y - otherPoint.y )
						);

						if ( distance < ( step * 0.9 ) ) {

							intersections.push( {
								x: point.x,
								y: point.y,
								coordA: new TvRoadCoord( pointCache[ i ].road, point.s ),
								coordB: new TvRoadCoord( pointCache[ j ].road, otherPoint.s ),
							} );

							// skip a few steps
							l += step * 2;
							k += step * 2;
						}
					}
				}
			}
		}

		// const t3 = performance.now();

		// const timeToFindIntersections = t3 - t2; console.log( "step2", timeToFindIntersections );

		return intersections;
	}

	private getJunctionSection ( road: TvRoad ): TvLaneSection | undefined {

		return road.laneSections.find( ls => ls.lanes.size <= 1 );

	}

	private getConnectedJunctions ( road: TvRoad ): TvJunction {

		for ( let [ _, junction ] of this.map.junctions ) {

			if ( junction instanceof TvVirtualJunction ) {

				if ( junction.mainRoadId === road.id ) {

					return junction

				}

				for ( let [ _, connection ] of junction.connections ) {

					if ( connection.incomingRoadId === road.id ) {

						return junction;

					}

				}

			} else {

				for ( let [ _, connection ] of junction.connections ) {

					if ( connection.incomingRoadId === road.id ) {

						return junction;

					}

				}

			}
		}
	}
}
