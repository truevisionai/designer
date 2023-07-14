/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvContactPoint, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { SceneService } from '../services/scene.service';
import { CreateJunctionConnection } from '../tools/maneuver/create-junction-connection';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';

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

	static createJunctionEntries (): JunctionEntryObject[] {

		const roads = TvMapInstance.map.getRoads().filter( road => !road.isJunction );

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

	static createJunctionEntriesForRoad ( road: TvRoad, contact: TvContactPoint ) {

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

				const junction = TvMapInstance.map.findJunction( entry.road, exit.road );

				if ( !junction ) {

					CommandHistory.execute( new CreateJunctionConnection( null, entry, exit, junction, null, null ) );

				} else {

					const connection = junction.findConnection( entry.road, exit.road );

					const laneLink = connection?.laneLink.find( i => i.from === entry.lane.id );

					if ( connection && laneLink ) {

						SnackBar.warn( 'Connection already exists' );

					} else {

						CommandHistory.execute( new CreateJunctionConnection( null, entry, exit, junction, connection, laneLink ) );

					}

				}

			}

		}

		return results;


	}
}
