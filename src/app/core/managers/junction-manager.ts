import { TvMapBuilder } from "app/modules/tv-map/builders/tv-map-builder";
import { TvLaneSide, TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvRoadCoord } from "app/modules/tv-map/models/tv-lane-coord";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { TvPosTheta } from "app/modules/tv-map/models/tv-pos-theta";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvMapInstance } from "app/modules/tv-map/services/tv-map-source-file";

interface TempIntersection {
	x: number,
	y: number,
	coordA?: TvRoadCoord,
	coordB?: TvRoadCoord,
}

export class JunctionManager {

	private static _instance = new JunctionManager();

	static get instance (): JunctionManager {
		return this._instance;
	}

	private constructor () {

	}

	// onRoadAdded ( road: TvRoad ): void {

	// }

	// onRoadRemoved ( road: TvRoad ): void {

	// }

	// onRoadMoved ( road: TvRoad ): void {

	// }

	onRoadModified ( road: TvRoad ): void {

		console.log( 'onRoadModified', road );

		const map = TvMapInstance.map;

		const intersections = this.findIntersectionsSlow( road );

		if ( intersections.length === 0 ) return;

		// check if the intersection is already present in the map
		const intersection = intersections[ 0 ];

		const roadAInterSection = intersection.coordA.road.laneSections.find( ls => ls.lanes.size <= 1 );
		const roadBInterSection = intersection.coordB.road.laneSections.find( ls => ls.lanes.size <= 1 );

		const roadAWidth = intersection.coordA.road.getRoadWidthAt( intersection.coordA.s );
		const roadBWidth = intersection.coordB.road.getRoadWidthAt( intersection.coordB.s );

		if ( roadAInterSection && roadBInterSection ) {

			console.log( 'update intersection', intersections );

			const roadANextLaneSection = intersection.coordA.road.laneSections.find( ls => ls.s > roadAInterSection.s );
			const roadBNextLaneSection = intersection.coordB.road.laneSections.find( ls => ls.s > roadBInterSection.s );

			if ( !roadANextLaneSection || !roadBNextLaneSection ) {
				console.error( roadANextLaneSection, roadBNextLaneSection );
				return;
			}


			roadAInterSection.attr_s = intersection.coordA.s - ( roadBWidth.totalWidth / 2 );
			roadBInterSection.attr_s = intersection.coordB.s - ( roadAWidth.totalWidth / 2 );

			roadANextLaneSection.attr_s = intersection.coordA.s + ( roadBWidth.totalWidth / 2 );
			roadBNextLaneSection.attr_s = intersection.coordB.s + ( roadAWidth.totalWidth / 2 );

			intersection.coordA.road.computeLaneSectionCoordinates();
			intersection.coordB.road.computeLaneSectionCoordinates();

			map.gameObject.remove( intersection.coordA.road.gameObject );
			map.gameObject.remove( intersection.coordB.road.gameObject );

			TvMapBuilder.rebuildRoad( intersection.coordA.road, false );
			TvMapBuilder.rebuildRoad( intersection.coordB.road, false );

		} else {

			console.log( 'create intersection', intersections );

			intersection.coordA.road
				.duplicateLaneSectionAt( intersection.coordA.s + ( roadBWidth.totalWidth / 2 ) )
				.deleteLeftLane()
				.deleteRightLane();

			intersection.coordB.road
				.duplicateLaneSectionAt( intersection.coordB.s + ( roadAWidth.totalWidth / 2 ) )
				.deleteLeftLane()
				.deleteRightLane();

			this.makeEmptyLaneSection( intersection.coordA.road.addGetLaneSection( intersection.coordA.s - ( roadBWidth.totalWidth / 2 ) ) );
			this.makeEmptyLaneSection( intersection.coordB.road.addGetLaneSection( intersection.coordB.s - ( roadAWidth.totalWidth / 2 ) ) );

			// intersection.coordA.road.getLaneSectionAt( intersection.coordA.s ).cloneAtS();
			// intersection.coordA.road.getLaneSectionAt( intersection.coordA.s ).cloneAtS();

			map.gameObject.remove( intersection.coordA.road.gameObject );
			map.gameObject.remove( intersection.coordB.road.gameObject );

			TvMapBuilder.rebuildRoad( intersection.coordA.road, false );
			TvMapBuilder.rebuildRoad( intersection.coordB.road, false );

		}

		console.log( intersection.coordA.road.laneSections.length, intersection.coordB.road.laneSections.length );
	}

	makeEmptyLaneSection ( lanesection: TvLaneSection ) {

		lanesection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, true, true );

	}

	findIntersectionsSlow ( road: TvRoad ): TempIntersection[] {

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

}
