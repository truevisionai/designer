/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import { TvLaneSection } from './tv-lane-section';
import { TvRoadLaneOffset } from './tv-road-lane-offset';
import { TvUtils } from './tv-utils';
import { TvRoad } from './tv-road.model';
import { TvContactPoint } from "./tv-common";

export class TvLaneProfile {

	public laneSections: TvLaneSection[] = [];

	public laneOffsets: TvRoadLaneOffset[] = [];

	private road: TvRoad;

	constructor ( road: TvRoad ) {

		this.road = road;

		// default record for all roads
		this.addLaneOffsetRecord( 0, 0, 0, 0, 0 );

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

	getLaneOffsets (): TvRoadLaneOffset[] {
		return this.laneOffsets;
	}

	getLaneSectionById ( id: number ) {
		return this.laneSections.find( laneSection => laneSection.id === id );
	}

	clearLaneSections () {
		this.laneSections.splice( 0, this.laneSections.length );
	}

	addLaneOffsetRecord ( s: number, a: number, b: number, c: number, d: number ): TvRoadLaneOffset {

		const laneOffset = new TvRoadLaneOffset( s, a, b, c, d );

		this.addLaneOffsetInstance( laneOffset );

		return laneOffset;
	}

	addGetLaneSection ( s: number, singleSide: boolean = false ): TvLaneSection {

		const laneSections = this.getLaneSections();

		const laneSectionId = laneSections.length + 1;

		const laneSection = new TvLaneSection( laneSectionId, s, singleSide, this.road );

		this.addLaneSectionInstance( laneSection );

		return laneSection;
	}

	getLaneSectionAt ( s: number ): TvLaneSection {

		return TvUtils.checkIntervalArray( this.laneSections, s );

	}

	/**
	 *
	 * @param s
	 * @param singleSide
	 * @deprecated use addGetLaneSection
	 */
	addLaneSection ( s: number, singleSide: boolean ) {

		this.addGetLaneSection( s, singleSide );

	}

	addLaneSectionInstance ( laneSection: TvLaneSection ): void {

		this.laneSections.push( laneSection );

		// laneSection.road = this;

		laneSection.lanes.forEach( lane => {

			// lane.roadId = this.id;

			lane.laneSection = laneSection;

		} );

		this.laneSections.push( laneSection );

		// this.sortLaneSections();

		// this.computeLaneSectionLength();

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

		// addLaneOffsetInstance ( laneOffset: TvRoadLaneOffset ): void {
		// 	this.addLaneOffsetInstance( laneOffset );
		// 	this.updateLaneOffsetValues( this.length );
		// }

	}

	updateLaneOffsetValues ( roadLength: number ) {

		TvUtils.computeCoefficients( this.laneOffsets, roadLength );

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

	getLaneOffsetEntryAt ( s: number ): TvRoadLaneOffset {

		return TvUtils.checkIntervalArray( this.laneOffsets, s );

	}

	clear () {

		this.laneSections = [];

		this.laneOffsets = [];

	}

	sortLaneSections () {

		// sort the lansections by s value

		this.laneSections.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		// const inDescOrder = ( a: [ number, TvLaneSection ], b: [ number, TvLaneSection ] ) => a[ 1 ].id > b[ 1 ].id ? -1 : 1;

		// const laneSections = this.laneSections.models( laneSection => [ laneSection.id, laneSection ] );

		// laneSections.sort( inDescOrder );

		// this.lanes.laneSections = laneSections.models( laneSection => laneSection[ 1 ] );

	}

	getLaneSectionAtContact ( contactPoint: TvContactPoint ): TvLaneSection {

		if ( contactPoint == TvContactPoint.START ) {

			return this.getFirstLaneSection();

		} else if ( contactPoint == TvContactPoint.END ) {

			return this.getLastLaneSection();

		}

	}

	removeLaneOffset ( laneOffset: TvRoadLaneOffset ): void {

		const index = this.getLaneOffsets().findIndex( i => i.uuid === laneOffset.uuid );

		if ( index !== -1 ) {

			this.getLaneOffsets().splice( index, 1 );

		}

		this.updateLaneOffsetValues( this.road.length );
	}

	addLaneOffset ( s: number, a: number, b: number, c: number, d: number ) {

		this.addLaneOffsetRecord( s, a, b, c, d );

		this.updateLaneOffsetValues( this.road.length );

	}

	getLaneOffsetAt ( number: number ) {

		return this.getLaneOffsetEntryAt( number );

	}

	computeLaneSectionCoordinates () {

		// Compute lastSCoordinate for all laneSections
		for ( let i = 0; i < this.laneSections.length; i++ ) {

			const currentLaneSection = this.laneSections[ i ];

			// lastSCoordinate by default is equal to road length
			let lastSCoordinate = this.road.length;

			// if next laneSection exists let's use its sCoordinate
			if ( i + 1 < this.laneSections.length ) {
				lastSCoordinate = this.laneSections[ i + 1 ].s;
			}

			currentLaneSection.endS = lastSCoordinate;
		}
	}

	computeLaneSectionLength () {

		this.computeLaneSectionCoordinates();

		const sections = this.getLaneSections();

		if ( sections.length == 0 ) return;

		// update first, not required
		// if ( sections.length == 1 ) sections[ 0 ].length = this.length;

		for ( let i = 1; i < sections.length; i++ ) {

			const current = sections[ i ];
			const previous = sections[ i - 1 ];

			previous.length = current.s - previous.s;
		}

		// update last
		sections[ sections.length - 1 ].length = this.road.length - sections[ sections.length - 1 ].s;
	}

	getLaneAt ( s: number, t: number ) {

		return this.getLaneSectionAt( s ).getLaneAt( s, t );

	}

	getLeftSideWidth ( s: number ) {

		let width = 0;

		const laneSection = this.getLaneSectionAt( s );

		if ( !laneSection ) return 0;

		laneSection.getLeftLanes().forEach( lane => {
			width += lane.getWidthValue( s );
		} );

		return width;
	}

	getRightsideWidth ( s: number ) {

		let width = 0;

		const laneSection = this.getLaneSectionAt( s );

		if ( !laneSection ) return 0;

		laneSection.getRightLanes().forEach( lane => {
			width += lane.getWidthValue( s );
		} );

		return width;

	}

	getRoadWidthAt ( s: number ) {

		let leftWidth = 0, rightWidth = 0;

		const laneSection = this.getLaneSectionAt( s );

		if ( !laneSection ) {

			return {
				totalWidth: 0,
				leftSideWidth: 0,
				rightSideWidth: 0
			};

		}

		laneSection
			.getLeftLanes()
			.forEach( lane => leftWidth += lane.getWidthValue( s ) );

		laneSection
			.getRightLanes()
			.forEach( lane => rightWidth += lane.getWidthValue( s ) );

		return {
			totalWidth: leftWidth + rightWidth,
			leftSideWidth: leftWidth,
			rightSideWidth: rightWidth,
		};
	}

}
