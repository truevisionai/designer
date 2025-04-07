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

	addDefaultLaneSection (): TvLaneSection {

		if ( this.laneSections.length > 0 ) return this.getFirstLaneSection();

		const laneSection = new TvLaneSection( this.laneSections.length + 1, 0, false, this.road )

		this.addLaneSection( laneSection );

		return laneSection;

	}

	getRoad (): TvRoad {
		return this.road;
	}

	getFirstLaneSection (): TvLaneSection {
		return this.laneSections[ 0 ];
	}

	getLastLaneSection (): TvLaneSection {
		return this.laneSections[ this.laneSections.length - 1 ];
	}

	getLaneSections (): TvLaneSection[] {
		return this.laneSections;
	}

	getLaneSectionCount (): number {
		return this.laneSections.length;
	}

	getLaneOffsets (): TvLaneOffset[] {
		return this.laneOffsets.toArray();
	}

	getLaneSectionById ( id: number ): TvLaneSection {
		return this.laneSections.find( laneSection => laneSection.id === id );
	}

	clearLaneSections (): void {
		this.laneSections.splice( 0, this.laneSections.length );
	}

	/**
	 * @param s
	 * @param singleSide
	 * @deprecated
	 */
	addGetLaneSection ( s: number, singleSide: boolean = false ): TvLaneSection {

		const laneSections = this.getLaneSections();

		const laneSectionId = laneSections.length + 1;

		const laneSection = new TvLaneSection( laneSectionId, s, singleSide, this.road );

		this.addLaneSection( laneSection );

		return laneSection;
	}

	getLaneSectionAt ( s: number ): TvLaneSection {

		const laneSection: TvLaneSection = TvUtils.checkIntervalArray( this.laneSections, s );

		if ( !laneSection ) {
			throw new LaneSectionNotFound( `Lane section not found at ${ s }` );
		}

		return laneSection;
	}

	/**
	 *
	 * @param s
	 * @param singleSide
	 * @deprecated use addGetLaneSection
	 */
	createAndAddLaneSection ( s: number, singleSide: boolean ): void {

		this.addGetLaneSection( s, singleSide );

	}

	private hasLaneSectionAt ( s: number ): boolean {

		return this.laneSections.find( laneSection => laneSection.s === s ) !== undefined;

	}

	addLaneSection ( laneSection: TvLaneSection ): void {

		if ( this.hasLaneSectionAt( laneSection.s ) ) {
			throw new Error( `Lane section already exists at ${ laneSection.s }` );
		}

		laneSection.road = this.road;

		laneSection.getLanes().forEach( lane => lane.laneSection = laneSection );

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

	updateLaneOffsetValues ( roadLength: number ): void {

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

	clear (): void {

		this.laneSections = [];

		this.laneOffsets.clear();

	}

	sortLaneSections (): void {

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

	getLaneOffsetAt ( number: number ): TvLaneOffset {

		return this.getLaneOffsetEntryAt( number );

	}

	computeLaneSectionCoordinates (): void {

		const laneSections = this.getLaneSections();

		// if ( laneSections.length == 0 ) {
		// 	Log.error( 'No lane sections found' );
		// }

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

	getLaneAt ( s: number, t: number ): TvLane {

		return this.getLaneSectionAt( s ).getLaneAt( s, t );

	}

	getLanes (): TvLane[] {

		return this.laneSections.flatMap( laneSection => laneSection.getLanes() );

	}

	getNonCenterLanes (): TvLane[] {

		return this.laneSections.flatMap( laneSection => laneSection.getNonCenterLanes() );

	}

	getLaneOffsetCount (): number {

		return this.laneOffsets.length;

	}

	getNextLaneSection ( laneSection: TvLaneSection ): TvLaneSection | undefined {

		const index = this.laneSections.indexOf( laneSection );

		if ( index === this.laneSections.length - 1 ) {

			return this.road.successor ? this.road.successor.laneSection : undefined;

		}

		return this.laneSections[ index + 1 ];

	}

	getPreviousLaneSection ( laneSection: TvLaneSection ): TvLaneSection | undefined {

		const index = this.laneSections.indexOf( laneSection );

		if ( index === 0 ) {

			return this.road.predecessor ? this.road.predecessor.laneSection : undefined;

		}

		return this.laneSections[ index - 1 ];

	}
}
