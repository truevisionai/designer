/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import { TvLaneSection } from './tv-lane-section';
import { TvRoadLaneOffset } from './tv-road-lane-offset';
import { TvUtils } from './tv-utils';

export class TvRoadLanes {

	public laneSections: TvLaneSection[] = [];

	public laneOffsets: TvRoadLaneOffset[] = [];

	constructor () {

		// default record for all roads
		this.addLaneOffsetRecord( 0, 0, 0, 0, 0 );

	}

	getLaneSections (): TvLaneSection[] {
		return this.laneSections;
	}

	getLaneOffsets (): TvRoadLaneOffset[] {
		return this.laneOffsets;
	}

	addLaneOffsetRecord ( s: number, a: number, b: number, c: number, d: number ): TvRoadLaneOffset {

		const laneOffset = new TvRoadLaneOffset( s, a, b, c, d );

		this.addLaneOffsetInstance( laneOffset );

		return laneOffset;
	}

	addLaneOffsetInstance ( laneOffset: TvRoadLaneOffset ): void {

		// Check if a lane offset with the same 's' already exists.
		const existingOffsetAtS = this.laneOffsets.find( lo => Maths.approxEquals( lo.s, laneOffset.s ) );

		// If it exists, update the values, else add a new record
		if ( existingOffsetAtS ) {

			// just update the values
			existingOffsetAtS.a = laneOffset.a;
			existingOffsetAtS.b = laneOffset.b;
			existingOffsetAtS.c = laneOffset.c;
			existingOffsetAtS.d = laneOffset.d;

		} else {

			this.laneOffsets.push( laneOffset );

			this.laneOffsets.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		}

	}

	updateLaneOffsetValues ( roadLength: number ) {

		TvUtils.computeCoefficients( this.laneOffsets, roadLength );

	}

	getLaneOffsetValue ( s: number ): number {

		if ( s == null ) throw new Error( 's is undefined' );

		let offset = 0;

		const hasEntry = this.getLaneOffsetEntryAt( s );

		if ( hasEntry ) offset = hasEntry.getValue( s );

		return offset;
	}

	getLaneOffsetEntryAt ( s: number ): TvRoadLaneOffset {

		return TvUtils.checkIntervalArray( this.laneOffsets, s );

	}

	clear () {
		this.laneSections = [];
		this.laneOffsets = [];
	}

}
