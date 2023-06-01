/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import { TvLaneSection } from './tv-lane-section';
import { TvRoadLaneOffset } from './tv-road-lane-offset';
import { TvRoad } from './tv-road.model';
import { TvUtils } from './tv-utils';

export class TvRoadLanes {

	public laneSections: TvLaneSection[] = [];

	private laneOffsets: TvRoadLaneOffset[] = [];

	constructor ( private road: TvRoad ) {

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

		const laneOffset = new TvRoadLaneOffset( this.road, s, a, b, c, d );

		this.addLaneOffsetInstance( laneOffset );

		return laneOffset;
	}

	addLaneOffsetInstance ( laneOffset: TvRoadLaneOffset ): void {

		// Check if a lane offset with the same 's' already exists.
		const existingOffset = this.laneOffsets.find( lo => Maths.approxEquals( lo.s, laneOffset.s ) );

		if ( existingOffset ) return;

		this.laneOffsets.push( laneOffset );

		this.laneOffsets.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}
	updateLaneOffsetValues ( roadLength: number ) {

		for ( let i = 0; i < this.laneOffsets.length && this.laneOffsets.length > 1; i++ ) {

			const current = this.laneOffsets[ i ];

			let pp0, pp1, pd0, pd1, length;

			if ( ( i + 1 ) < this.laneOffsets.length ) {

				const next = this.laneOffsets[ i + 1 ];

				// next s cannot be less than current so we need to clamp it
				if ( next.s <= current.s ) {

					next.s = current.s + 0.1;

				}

				length = next.s - current.s;

				pp0 = current.a;          // offset at start
				pp1 = next.a;             // offset at end
				pd0 = current.b;          // tangent at start
				pd1 = next.b;             // tangent at end

			} else {

				// take lane section length
				length = roadLength;

				pp0 = current.a;          // offset at start
				pp1 = current.a;          // offset at end
				pd0 = current.b;          // tangent at start
				pd1 = current.b;          // tangent at end

			}

			let a = pp0;
			let b = pd0;
			let c = ( -3 * pp0 ) + ( 3 * pp1 ) + ( -2 * pd0 ) + ( -1 * pd1 );
			let d = ( 2 * pp0 ) + ( -2 * pp1 ) + ( 1 * pd0 ) + ( 1 * pd1 );

			b /= length;
			c /= length * length;
			d /= length * length * length;

			current.a = a;
			current.b = b;
			current.c = c;
			current.d = d;

		}

	}

	computeLaneSectionEnd ( road: TvRoad ) {

		// Compute lastSCoordinate for all laneSections
		for ( let i = 0; i < this.laneSections.length; i++ ) {

			const currentLaneSection = this.laneSections[ i ];

			// by default it is equal to road lenght
			let lastSCoordinate = 0;

			// if next laneSection exists lets use its sCoordinate
			if ( i + 1 < this.laneSections.length ) {

				const nextLaneSection = this.laneSections[ i + 1 ];
				lastSCoordinate = nextLaneSection.attr_s;

			} else {


				lastSCoordinate = road.length;
			}

			currentLaneSection.lastSCoordinate = lastSCoordinate;
		}
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

	getLaneSectionAt ( s: number ): TvLaneSection {

		return TvUtils.checkIntervalArray( this.laneSections, s );

	}
}
