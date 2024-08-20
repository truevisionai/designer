/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSection } from './tv-lane-section';
import { TvLaneOffset } from './tv-lane-offset';
import { TvUtils } from './tv-utils';
import { TvRoad } from './tv-road.model';
import { TvContactPoint } from "./tv-common";
import { Log } from 'app/core/utils/log';
import { LaneSectionNotFound } from 'app/exceptions/exceptions';
import { TvLane } from './tv-lane';
import { PolynomialArray } from 'app/core/models/ordered-array';

export class TvLaneProfile {

	private laneSections: TvLaneSection[];

	private laneOffsets: PolynomialArray<TvLaneOffset>;

	constructor ( private road: TvRoad ) {

		this.laneSections = [];

		this.laneOffsets = new PolynomialArray();

	}

	getRoad (): TvRoad {
		return this.road;
	}

	getFirstLaneSection () {
		return this.laneSections[ 0 ];
	}

	getLastLaneSection () {
		return this.laneSections[ this.laneSections.length - 1 ];
	}

	getLaneSections (): TvLaneSection[] {
		return this.laneSections;
	}

	getLaneOffsets (): TvLaneOffset[] {
		return this.laneOffsets.toArray();
	}

	getLaneSectionById ( id: number ) {
		return this.laneSections.find( laneSection => laneSection.id === id );
	}

	clearLaneSections () {
		this.laneSections.splice( 0, this.laneSections.length );
	}

	addGetLaneSection ( s: number, singleSide: boolean = false ): TvLaneSection {

		const laneSections = this.getLaneSections();

		const laneSectionId = laneSections.length + 1;

		const laneSection = new TvLaneSection( laneSectionId, s, singleSide, this.road );

		this.addLaneSectionInstance( laneSection );

		return laneSection;
	}

	getLaneSectionAt ( s: number ): TvLaneSection {

		const laneSection: TvLaneSection = TvUtils.checkIntervalArray( this.laneSections, s );

		if ( !laneSection ) {
			throw new LaneSectionNotFound();
		}

		return laneSection;
	}

	/**
	 *
	 * @param s
	 * @param singleSide
	 * @deprecated use addGetLaneSection
	 */
	createAndAddLaneSection ( s: number, singleSide: boolean ) {

		this.addGetLaneSection( s, singleSide );

	}

	addLaneSectionInstance ( laneSection: TvLaneSection ): void {

		laneSection.road = this.road;

		laneSection.lanesMap.forEach( lane => {

			lane.roadId = this.road.id;

			lane.laneSection = laneSection;

		} );

		this.laneSections.push( laneSection );

		this.sortLaneSections();

		this.computeLaneSectionCoordinates();

	}

	createAndAddLaneOffset ( s: number, a: number, b: number, c: number, d: number ): TvLaneOffset {

		const laneOffset = new TvLaneOffset( s, a, b, c, d );

		this.addLaneOffset( laneOffset );

		return laneOffset;

	}

	addLaneOffset ( laneOffset: TvLaneOffset ): void {

		this.laneOffsets.push( laneOffset );

	}

	updateLaneOffsetValues ( roadLength: number ) {

		this.laneOffsets.computeCoefficients( roadLength );

	}

	getLaneOffsetValue ( s: number ): number {

		if ( s == null ) {
			console.error( 's is undefined' );
			return 0;
		}

		let offset = 0;

		const hasEntry = this.getLaneOffsetEntryAt( s );

		if ( hasEntry ) offset = hasEntry.getValue( s );

		return offset;
	}

	getLaneOffsetEntryAt ( s: number ): TvLaneOffset {

		return this.laneOffsets.findAt( s );

	}

	clear () {

		this.laneSections = [];

		this.laneOffsets.clear();

	}

	sortLaneSections () {

		this.laneSections.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		this.laneOffsets.sort();

	}

	getLaneSectionAtContact ( contactPoint: TvContactPoint ): TvLaneSection {

		if ( contactPoint == TvContactPoint.START ) {

			return this.getFirstLaneSection();

		} else if ( contactPoint == TvContactPoint.END ) {

			return this.getLastLaneSection();

		} else {

			console.error( `TvRoadCoord.laneSection: Invalid contact point ${ contactPoint }` );

			return this.road.getLaneProfile().getFirstLaneSection();

		}

	}

	removeLaneOffset ( laneOffset: TvLaneOffset ): void {

		const index = this.getLaneOffsets().findIndex( i => i.uuid === laneOffset.uuid );

		if ( index !== -1 ) {

			this.getLaneOffsets().splice( index, 1 );

		}

		this.updateLaneOffsetValues( this.road.length );
	}

	getLaneOffsetAt ( number: number ) {

		return this.getLaneOffsetEntryAt( number );

	}

	computeLaneSectionCoordinates () {

		const laneSections = this.getLaneSections();

		if ( laneSections.length == 0 ) {
			Log.error( 'No lane sections found' );
		}

		// Compute lastSCoordinate for all laneSections
		for ( let i = 0; i < laneSections.length - 1; i++ ) {

			const laneSection = laneSections[ i ];

			const nextLaneSection = laneSections[ i + 1 ];

			laneSection.endS = nextLaneSection ? nextLaneSection.s : this.road.length;

			// laneSection.getLength() = laneSection.endS - laneSection.s;

			laneSection.setLength( laneSection.endS - laneSection.s );

		}

		if ( laneSections.length > 0 ) {

			const lastLaneSection = laneSections[ laneSections.length - 1 ];

			lastLaneSection.endS = this.road.length;

			lastLaneSection.setLength( lastLaneSection.endS - lastLaneSection.s );

		}


	}

	getLaneAt ( s: number, t: number ) {

		return this.getLaneSectionAt( s ).getLaneAt( s, t );

	}

	getLanes (): TvLane[] {

		return this.laneSections.flatMap( laneSection => laneSection.getLaneArray() );

	}

	getLaneOffsetCount () {

		return this.laneOffsets.length;

	}
}
