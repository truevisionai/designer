/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvContactPoint, TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { SceneService } from '../services/scene.service';
import { CreateJunctionConnection } from '../tools/maneuver/create-junction-connection';
import { TvConsole } from '../utils/console';

export class JunctionFactory {

	static createJunctions () {

		const roads = TvMapInstance.map.getRoads();

		const entries = this.createEntries( roads );

		this.findEntryExitCombinations( entries );
	}

	static showJunctionEntries () {

		const roads = TvMapInstance.map.getRoads();

		const entries = this.createEntries( roads );

		entries.forEach( entry => {

			SceneService.add( entry );

		} );
	}

	static createJunctionEntries ( allRoads: TvRoad[] ): JunctionEntryObject[] {

		const roads = allRoads.filter( road => !road.isJunction );

		return this.createEntries( roads );

	}

	static createEntries ( roads: TvRoad[] ) {

		const entries: JunctionEntryObject[] = [];

		for ( let i = 0; i < roads.length; i++ ) {

			entries.push( ...this.createJunctionEntriesForRoad( roads[ i ], TvContactPoint.START ) );

			entries.push( ...this.createJunctionEntriesForRoad( roads[ i ], TvContactPoint.END ) );

		}

		return entries;
	}

	static autoMergeEntries ( roads: TvRoad[] ) {

		// for ( let i = 0; i < roads.length; i++ ) {
		//
		// 	const road = roads[ i ];
		// 	const start = road.getStartCoord().toVector3();
		// 	const end = road.getEndCoord().toVector3();
		//
		// 	for ( let j = i + 1; j < roads.length; j++ ) {
		//
		// 		const otherRoad = roads[ j ];
		// 		const otherStart = otherRoad.getStartCoord().toVector3();
		// 		const otherEnd = otherRoad.getEndCoord().toVector3();
		//
		// 		if ( start.distanceTo( otherStart ) <= 60 ) {
		//
		// 			this.addEntries( road, TvContactPoint.START );
		// 			this.addEntries( otherRoad, TvContactPoint.START );
		//
		// 		}
		//
		// 		if ( start.distanceTo( otherEnd ) <= 60 ) {
		//
		// 			this.addEntries( road, TvContactPoint.START );
		// 			this.addEntries( otherRoad, TvContactPoint.END );
		//
		// 		}
		//
		// 		if ( end.distanceTo( otherEnd ) <= 60 ) {
		//
		// 			this.addEntries( road, TvContactPoint.END );
		// 			this.addEntries( otherRoad, TvContactPoint.END );
		//
		// 		}
		//
		// 	}
		//
		// }

	}

	static findEntryExitCombinations ( objects: JunctionEntryObject[] ) {

		const results = [];

		for ( let i = 0; i < objects.length; i++ ) {

			const left = objects[ i ];

			for ( let j = i + 1; j < objects.length; j++ ) {

				const right = objects[ j ];

				// dont merge same road
				if ( left.road.id == right.road.id ) continue;

				// we only want to merge
				// 1 with 1 or
				// -1 with 1 or
				// 1 with -1
				// -1 with -1
				// to ensure we have straight connections first
				if ( Math.abs( left.lane.id ) != Math.abs( right.lane.id ) ) continue;

				// dont merge if both are entries
				if ( left.isEntry && right.isEntry ) continue;

				// dont merge if both are exits
				if ( left.isExit && right.isExit ) continue;

				const entry = left.isEntry ? left : right;

				const exit = left.isExit ? left : right;

				results.push( {
					entry: entry,
					exit: exit
				} );

			}

		}

		return results;

	}

	static createJunctionEntriesForRoad ( road: TvRoad, contact: TvContactPoint ): JunctionEntryObject[] {

		const laneSection = contact == TvContactPoint.START ?
			road.getFirstLaneSection() :
			road.getLastLaneSection();

		const lanes = laneSection.getLaneArray().filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving );

		return lanes.map( lane => this.createJunctionEntry( road, lane, contact ) );
	}

	static createJunctionEntry ( road: TvRoad, lane: TvLane, contact: TvContactPoint ): JunctionEntryObject {

		const s = contact == TvContactPoint.START ? 0 : road.length;

		const position = TvMapQueries.getLanePosition( road.id, lane.id, s );

		const name = `road-${ road.id }-lane-${ lane.id }-${ contact }`;

		return new JunctionEntryObject( name, position, contact, road, lane );
	}

	static mergeEntries ( objects: JunctionEntryObject[] ) {

		const results: JunctionEntryObject[] = [];

		for ( let i = 0; i < objects.length; i++ ) {

			const left = objects[ i ];

			for ( let j = i + 1; j < objects.length; j++ ) {

				const right = objects[ j ];

				if ( left.canConnect( right ) && left.isStraightConnection( right ) ) {

					console.log( 'straight' );

					const entry = left.isEntry ? left : right;
					const exit = left.isExit ? left : right;

					this.connect( entry, exit );

					results.push( entry );
					results.push( exit );

				}

			}

		}

		const unconnected = objects.filter( object => object.isLastDrivingLane() );

		for ( let i = 0; i < unconnected.length; i++ ) {

			const left = unconnected[ i ];

			for ( let j = 0; j < results.length; j++ ) {

				const right = results[ j ];

				if ( left.id == right.id ) continue;

				if ( left.isStraightConnection( right ) ) continue;

				if ( !left.canConnect( right, 'complex' ) ) continue;

				// for right connections we want the right most lane
				if ( left.isRightConnection( right ) && right.isRightMost() ) {

					const entry = left.isEntry ? left : right;
					const exit = left.isExit ? left : right;

					this.connect( entry, exit );

					// for left connections we want the left most lane
				} else if ( left.isLeftConnection( right ) && right.isLeftMost() ) {

					const entry = left.isEntry ? left : right;
					const exit = left.isExit ? left : right;

					this.connect( entry, exit );

				}


			}

		}

		return results;
	}

	// merging entries based on angle
	static mergeComplexEntries ( objects: JunctionEntryObject[] ) {

		const results = [];

		for ( let i = 0; i < objects.length; i++ ) {

			const A = objects[ i ];

			const mergeOptions = objects
				.filter( B => B.road.id !== A.road.id )
				.filter( B => B.junctionType != A.junctionType )
				.filter( B => !A.canConnect( B ) )
				.forEach( B => {

					const aPos = A.getJunctionPosTheta();
					const bPos = B.getJunctionPosTheta();

					const sideAngle = aPos.computeSideAngle( bPos );

					if ( sideAngle.angleDiff <= 20 ) {

						// for straight connections we only merge same lane-id
						if ( Math.abs( A.lane.id ) != Math.abs( B.lane.id ) ) return;

						console.log( 'straight' );

						const entry = A.isEntry ? A : B;

						const exit = A.isExit ? A : B;

						this.connect( entry, exit );

					} else if ( sideAngle.side == TvLaneSide.LEFT ) {

						if ( B.isLastDrivingLane() ) return;

						console.log( 'left' );

						const entry = A.isEntry ? A : B;

						const exit = A.isExit ? A : B;

						this.connect( entry, exit );

					} else if ( sideAngle.side == TvLaneSide.RIGHT ) {

						if ( B.isLastDrivingLane() ) return;

						console.log( 'right' );

						const entry = A.isEntry ? A : B;

						const exit = A.isExit ? A : B;

						this.connect( entry, exit );

					}

				} );


			console.log( A, mergeOptions );

		}
	}

	static straightConnection ( entry: JunctionEntryObject, exit: JunctionEntryObject ) {

		const aPos = entry.getJunctionPosTheta();
		const bPos = exit.getJunctionPosTheta();

		const sideAngle = aPos.computeSideAngle( bPos );

		if ( sideAngle.angleDiff <= 20 ) {

			// for straight connections we only merge same lane-id
			if ( Math.abs( entry.lane.id ) != Math.abs( exit.lane.id ) ) return;

			console.log( 'straight' );

			this.connect( entry, exit );

		}

		// else if ( sideAngle.side == TvLaneSide.LEFT ) {

		// 	if ( exit.isLastDrivingLane() ) return;

		// 	console.log( 'left' );

		// 	this.connect( entry, exit );

		// } else if ( sideAngle.side == TvLaneSide.RIGHT ) {

		// 	if ( exit.isLastDrivingLane() ) return;

		// 	console.log( 'right' );

		// 	this.connect( entry, exit );

		// }

	}

	static connect ( entry: JunctionEntryObject, exit: JunctionEntryObject ) {

		const junction = TvMapInstance.map.findJunction( entry.road, exit.road );

		if ( !junction ) {

			CommandHistory.execute( new CreateJunctionConnection( null, entry, exit, junction, null, null ) );

		} else {

			const connection = junction.findRoadConnection( entry.road, exit.road );

			const laneLink = connection?.laneLink.find( i => i.from === entry.lane.id );

			if ( connection && laneLink ) {

				TvConsole.warn( 'Connection already exists' );
				SnackBar.warn( 'Connection already exists' );

			} else {

				CommandHistory.execute( new CreateJunctionConnection( null, entry, exit, junction, connection, laneLink ) );

			}

		}

	}
}
