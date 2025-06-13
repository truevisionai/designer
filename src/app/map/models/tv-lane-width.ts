/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';
import { TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvUtils } from './tv-utils';
import { Maths } from 'app/utils/maths';

export const LANE_WIDTH = {
	DEFAULT_LANE_WIDTH: 3.6
}

export class TvLaneWidth extends ThirdOrderPolynom {

	constructor ( s: number, a: number, b: number, c: number, d: number ) {

		super( s, a, b, c, d );

	}

	clone ( s?: number ): TvLaneWidth {

		return new TvLaneWidth( s || this.s, this.a, this.b, this.c, this.d );

	}

	toXODR (): Record<string, number> {
		return {
			attr_sOffset: this.s,
			attr_a: this.a,
			attr_b: this.b,
			attr_c: this.c,
			attr_d: this.d,
		}
	}
}


export class TvLaneWidthProfile {

	private widths: TvLaneWidth[] = [];

	constructor ( private lane: TvLane ) { }

	private validateLane ( lane: TvLane ): void {

		this.ensureMinWidthRecord( lane );
		lane.sortWidth();
		lane.removeInvalidWidths();

	}

	private ensureMinWidthRecord ( lane: TvLane ): void {

		if ( lane.isCenter ) {
			lane.clearLaneWidth();
			return;
		}


		if ( lane.getLaneWidthCount() == 0 ) {

			lane.addWidthRecord( 0, this.getWidthByType( lane.type ), 0, 0, 0 );

		} else {

			const firstWidth = lane.getWidthArray()[ 0 ];

			if ( firstWidth.s != 0 ) {

				lane.addWidthRecord( 0, firstWidth.a, firstWidth.b, firstWidth.c, firstWidth.d );

			}

		}

	}

	private getWidthByType ( type: TvLaneType ): number {

		switch ( type ) {

			case TvLaneType.driving: return 3.6;
			case TvLaneType.parking: return 5.5;
			case TvLaneType.sidewalk: return 2.0;
			case TvLaneType.stop: return 2.0;
			case TvLaneType.shoulder: return 0.5;
			case TvLaneType.biking: return 2.0;
			case TvLaneType.border: return 0.5;
			case TvLaneType.median: return 1.0;
			case TvLaneType.curb: return 1.0;

			default: return 3.6;

		}

	}

	removeInvalidWidths (): void {

		for ( let i = 0; i < this.widths.length; i++ ) {

			const width = this.widths[ i ];

			// Remove nodes that are out of bounds
			if ( width.s < 0 || width.s > this.lane.laneSection.getLength() ) {
				this.widths.splice( i, 1 );
			}
		}

	}

	updateCoefficients (): void {

		TvUtils.computeCoefficients( this.widths, this.lane.laneSection.getLength() );

	}

	removeWidthRecord ( laneWidth: TvLaneWidth ): void {

		this.widths.splice( this.widths.indexOf( laneWidth ), 1 );

		this.sortWidth();

	}

	addWidthRecord ( laneWidth: TvLaneWidth ): void {

		const index = this.widths.findIndex( width => Maths.approxEquals( width.s, laneWidth.s ) );

		if ( index >= 0 ) {
			this.widths[ index ].copyCoefficients( laneWidth );
		} else {
			this.widths.push( laneWidth );
		}

		this.sortWidth();
	}

	sortWidth (): void {
		this.widths.sort( ( a, b ) => a.s > b.s ? 1 : -1 );
	}

	getWidthAt ( s: number ): TvLaneWidth {
		return TvUtils.checkIntervalArray( this.widths, s );
	}

	getWidthArray (): TvLaneWidth[] {
		return this.widths;
	}

	getWidthCount (): number {
		return this.widths.length;
	}

	clear (): void {
		this.widths.splice( 0, this.widths.length );
	}

}
