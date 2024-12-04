/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/objects/game-object';
import { MathUtils } from 'three';
import { TvContactPoint, TvLaneSide, TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvRoad } from './tv-road.model';
import { Maths } from "../../utils/maths";
import { LaneNotFound } from 'app/exceptions/exceptions';
import { LaneUtils } from 'app/utils/lane.utils';
import { TvLaneCoord } from './tv-lane-coord';
import { createLaneDistance } from '../road/road-distance';
import { LaneSectionWidthCalculator } from "./lane-section-width-calculator";

const DESC = ( a: TvLane, b: TvLane ) => b.id - a.id;
const ASC = ( a: TvLane, b: TvLane ) => a.id - b.id;

export class TvLaneSection {

	public readonly id: number;

	public readonly uuid: string;

	public gameObject: GameObject;

	public readonly s: number;

	private singleSide: boolean;

	// old property
	public endS: number;

	private lanes: Map<number, TvLane> = new Map<number, TvLane>();

	private length: number;

	private readonly widthCalculator: LaneSectionWidthCalculator;

	constructor ( id: number, s: number, singleSide: boolean, public road: TvRoad ) {
		this.uuid = MathUtils.generateUUID();
		this.id = id;
		this.s = s;
		this.singleSide = singleSide;
		this.widthCalculator = new LaneSectionWidthCalculator( this );
	}

	getRoad (): TvRoad {
		return this.road;
	}

	getLength (): number {
		return this.length;
	}

	setLength ( value: number ): void {
		this.length = value;
	}

	private get lanesMap (): Map<number, TvLane> {
		return this.lanes;
	}

	private get laneArray (): TvLane[] {
		return [ ...this.lanes.values() ];
	}

	hasLane ( lane: TvLane | number ): boolean {

		if ( typeof lane === 'number' ) {
			return this.lanes.has( lane );
		}

		return this.lanes.has( lane.id );
	}

	getWidthUptoStart ( lane: TvLane, sCoordinate: number ): number {
		return this.widthCalculator.getWidthUptoStart( lane, sCoordinate );
	}

	getWidthUptoEnd ( lane: TvLane, sCoordinate: number ): number {
		return this.widthCalculator.getWidthUptoEnd( lane, sCoordinate );
	}

	getWidthUptoCenter ( lane: TvLane, sCoordinate: number ): number {
		return this.widthCalculator.getWidthUptoCenter( lane, sCoordinate );
	}

	/**
	 * Add a lane to the lane section
	 *
	 * @param {TvLaneSide} laneSide side the side of the road to which the lane will be added
	 * @param {number} id of the lane
	 * @param {string} type of the lane (Section 6.5 of the OpenDRIVE specification)
	 * @param {boolean} level Level parameter of the road
	 * @param {boolean} sort Defines if the lanes should be sorted when added. True by default
	 */
	createLane ( laneSide: TvLaneSide, id: number, type: TvLaneType, level: boolean, sort: boolean ): TvLane {

		const newLane = new TvLane( laneSide, id, type, level, this );

		this.addLaneInstance( newLane, sort );

		return newLane;
	}

	createCenterLane ( id: number, type: TvLaneType, level: boolean, sort: boolean ): TvLane {

		return this.createLane( TvLaneSide.CENTER, id, type, level, sort );

	}

	createLeftLane ( id: number, type: TvLaneType, level: boolean, sort: boolean ): TvLane {

		return this.createLane( TvLaneSide.LEFT, id, type, level, sort );

	}

	createRightLane ( id: number, type: TvLaneType, level: boolean, sort: boolean ): TvLane {

		return this.createLane( TvLaneSide.RIGHT, id, type, level, sort );

	}

	getLaneAtIndex ( index: number ): TvLane {

		if ( this.lanes.size > 0 && index < this.lanes.size ) {
			return this.laneArray[ index ];
		}

		return null;
	}

	getLaneCount (): number {

		return this.lanes.size;

	}

	getLanes (): TvLane[] {

		return this.laneArray;

	}

	getNonCenterLanes (): TvLane[] {

		return this.getLanes().filter( lane => !lane.isCenter );

	}

	getDrivingLanes (): TvLane[] {

		return this.getLanes().filter( lane => !lane.isCenter && lane.isDrivingLane );

	}

	/**
	 * Check if the tested s-offset is inside the lane section interval
	 * @param sCheck A double s-offset value that has to be checked
	 * @returns {boolean} Return true if the s-offset value belongs to current lane section, false otherwise
	 */
	checkInterval ( sCheck: any ): boolean {

		if ( sCheck >= this.s ) {
			return true;
		}

		return false;
	}

	getLeftLaneCount (): number {

		return this.getLeftLanes().length;

	}

	getLeftLanes (): TvLane[] {

		return this.laneArray.filter( lane => lane.isLeft );

	}

	areLeftLanesInOrder (): boolean {

		const leftLanes = this.getLeftLanes();

		for ( let i = 0; i < leftLanes.length; i++ ) {

			const lane = leftLanes[ i ];

			const expectedLaneId = leftLanes.length - i;

			if ( lane.id !== expectedLaneId ) {

				return false;

			}

		}

		return true;
	}

	areRightLanesInOrder (): boolean {

		const rightLanes = this.getRightLanes();

		for ( let i = 0; i < rightLanes.length; i++ ) {

			const lane = rightLanes[ i ];

			const expectedLaneId = -( i + 1 );

			if ( lane.id !== expectedLaneId ) {

				return false;

			}

		}

		return true;
	}

	getCenterLanes (): TvLane[] {

		return this.laneArray.filter( lane => lane.isCenter );

	}

	getRightLaneCount (): number {

		return this.getRightLanes().length;

	}

	getRightLanes (): TvLane[] {

		return this.laneArray.filter( lane => lane.isRight );

	}

	getLaneById ( laneId: number ): TvLane {

		if ( !this.lanes.has( laneId ) ) {
			throw new LaneNotFound( laneId );
		}

		return this.lanes.get( laneId );

	}

	addCenterLane (): TvLane {

		return this.createCenterLane( 0, TvLaneType.none, false, true );

	}

	addLaneInstance ( newLane: TvLane, sort: boolean = true ): void {

		newLane.laneSection = this;

		if ( this.lanes.has( newLane.id ) ) {

			const lanes = [ ...this.lanes.entries() ];

			this.lanes.clear();

			for ( let [ id, lane ] of lanes ) {

				// shift left lanes
				if ( id >= newLane.id && newLane.id > 0 ) lane.id = ( lane.id + 1 );

				// shift right lanes
				if ( id <= newLane.id && newLane.id < 0 ) lane.id = ( lane.id - 1 );

				this.lanes.set( lane.id, lane );

			}

		}

		this.lanes.set( newLane.id, newLane );

		if ( sort ) this.sortLanes();
	}

	sortLanes (): void {

		const sortedLanes = this.getLanes().sort( DESC );

		this.lanes.clear();

		for ( const lane of sortedLanes ) {
			this.lanes.set( lane.id, lane );
		}

	}

	getRightMostLane (): TvLane {

		return this.laneArray[ this.lanes.size - 1 ];

	}

	getLeftMostLane (): TvLane {

		return this.laneArray[ 0 ];

	}

	removeLane ( deletedLane: TvLane ): void {

		if ( !this.hasLane( deletedLane.id ) ) {
			throw new LaneNotFound( deletedLane.id );
		}

		this.lanes.delete( deletedLane.id );

		const lanes = [ ...deletedLane.laneSection.lanes.entries() ];

		this.lanes.clear();

		// create a new models
		let newLaneMap = new Map<number, TvLane>();

		// iterate through the old models
		for ( let [ id, lane ] of lanes ) {

			// shift left lanes
			if ( id > deletedLane.id && deletedLane.id > 0 ) lane.id = ( id - 1 );

			// shift right lanes
			if ( id < deletedLane.id && deletedLane.id < 0 ) lane.id = ( id + 1 );

			newLaneMap.set( lane.id, lane );

		}

		this.lanes = newLaneMap;

		this.sortLanes()

	}

	getLaneAt ( s: number, t: number ): TvLane {

		const isLeft = t > 0;
		const isRight = t < 0;

		if ( Math.abs( t ) < 0.1 ) {
			return this.getLaneById( 0 );
		}

		for ( const lane of this.getLanes() ) {

			// logic to skip left or right lanes depending on t value
			if ( isLeft && lane.isRight ) continue;
			if ( isRight && lane.isLeft ) continue;

			const startT = this.getWidthUptoStart( lane, s );
			const endT = this.getWidthUptoEnd( lane, s );

			if ( Math.abs( t ) > startT && Math.abs( t ) < endT ) {
				return lane;
			}

		}
	}

	cloneAtS ( id?: number, s?: number, side?: boolean, road?: TvRoad ): TvLaneSection {

		const laneSection = new TvLaneSection(
			id || 0,
			s || this.s,
			side || this.singleSide,
			road || this.road
		);

		this.lanes.forEach( lane => {

			laneSection.addLaneInstance( lane.cloneAtS( lane.id, s || 0 ) );

		} );

		return laneSection;
	}

	removeLeftLanes (): void {

		this.getLeftLanes().forEach( lane => this.lanes.delete( lane.id ) );

	}

	removeRightLanes (): void {

		this.getRightLanes().forEach( lane => this.lanes.delete( lane.id ) );

	}

	toString (): string {

		return `LaneSection: id: ${ this.id } s: ${ this.s } laneCount: ${ this.getLaneCount() }`;

	}

	isMatching ( laneSection: TvLaneSection ): boolean {

		if ( this.lanes.size !== laneSection.lanes.size ) return false;

		for ( const lane of this.getLanes() ) {

			const otherLane = this.lanes.get( lane.id );

			if ( !otherLane ) return false;

			if ( !lane.isMatching( otherLane ) ) {
				return false;
			}

		}

		return true;

	}

	isHeightMatching ( laneSection: TvLaneSection, sOffset: number = 0, otherSOffset: number = 0 ): boolean {

		if ( this.lanes.size !== laneSection.lanes.size ) return false;

		for ( const lane of this.getLanes() ) {

			const otherLane = laneSection.lanes.get( lane.id );

			if ( !otherLane ) return false;

			const heightA = lane.getHeightValue( sOffset );
			const heightB = otherLane.getHeightValue( otherSOffset );

			if ( !heightA.matches( heightB ) ) {
				return false;
			}

		}

		return true;
	}

	isWidthMatching ( laneSection: TvLaneSection, sOffset: number = 0, otherSOffset: number = 0 ): boolean {

		if ( this.lanes.size !== laneSection.lanes.size ) return false;

		for ( const lane of this.getLanes() ) {

			const otherLane = laneSection.lanes.get( lane.id );

			if ( !otherLane ) return false;

			const widthA = lane.getWidthValue( sOffset );
			const widthB = otherLane.getWidthValue( otherSOffset );

			if ( !Maths.approxEquals( widthA, widthB ) ) return false;

		}

		return true;
	}

	isMarkingMatching ( otherLaneSection: TvLaneSection, sOffset: number = 0, otherSOffset: number = 0 ): boolean {

		if ( this.lanes.size !== otherLaneSection.lanes.size ) return false;

		for ( let [ id, lane ] of this.lanesMap ) {

			const otherLane = otherLaneSection.getLaneById( id );

			if ( !otherLane ) return false;

			const roadMarkA = lane.getRoadMarkAt( sOffset );

			const roadMarkB = otherLane.getRoadMarkAt( otherSOffset );

			if ( !roadMarkA && !roadMarkB ) continue;

			if ( !roadMarkA && roadMarkB ) return false;

			if ( roadMarkA && !roadMarkB ) return false;

			if ( !roadMarkA.isMatching( roadMarkB ) ) return false;

		}

		return true;
	}

	getNearestLane ( targetLane: TvLane, side?: TvLaneSide ): TvLane {

		if ( !targetLane ) return null;

		if ( targetLane.id === 0 ) return null;

		if ( targetLane.id > 0 ) {

			const leftLanes = this.getLeftLanes();

			let result: TvLane;

			for ( let id = 1; id <= leftLanes.length; id++ ) {

				const lane = this.getLaneById( id );

				if ( lane ) {

					if ( lane.type == targetLane.type ) {

						result = lane;

					}
					if ( lane.id >= targetLane.id ) break;

				} else {

					break;

				}

			}

			return result;

		}

		if ( targetLane.id < 0 ) {

			const rightLanes = this.getRightLanes();

			let result: TvLane;

			for ( let id = 1; id <= rightLanes.length; id++ ) {

				const lane = this.getLaneById( -id );

				if ( lane ) {

					if ( lane.type == targetLane.type ) {

						result = lane;

					}

					if ( lane.id <= targetLane.id ) break;

				} else {

					break;

				}

			}

			return result;

		}

	}

	static getNearestLane ( lanes: TvLane[], targetLane: TvLane ): TvLane {

		if ( !targetLane ) return null;

		if ( targetLane.id === 0 ) return null;

		let closestLane: TvLane | null = null;

		for ( let i = 0; i < lanes.length; i++ ) {

			const currentLane = lanes[ i ];

			const currentLaneId = currentLane.id;

			if ( currentLane.id == 0 ) continue;

			if ( currentLane.type != targetLane.type ) continue;

			const currentLaneDiff = Math.abs( Math.abs( currentLaneId ) - Math.abs( targetLane.id ) );

			const closestLaneDiff = closestLane ? Math.abs( Math.abs( closestLane.id ) - Math.abs( targetLane.id ) ) : Infinity;

			// Update closestLane only if it's closer to the requested laneId
			if ( !closestLane || currentLaneDiff < closestLaneDiff ) {
				closestLane = currentLane;
			}

			if ( currentLane.id === targetLane.id ) {
				return currentLane; // Exact match
			}

		}

		return closestLane;

	}

	computeWidthAt ( sOffset: number ): number {

		return this.widthCalculator.getWidthAt( sOffset );

	}

	getHighestCarriageWayLane (): TvLane {

		const lanes = this.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => this.isCarriageWayLane( lane ) );

		return this.findHighest( lanes );

	}

	getLowestCarriageWayLane (): TvLane {

		const lanes = this.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => this.isCarriageWayLane( lane ) );

		return this.findLowest( lanes );

	}

	getLowestDrivingLane (): TvLane {

		return this.getLowestLane( TvLaneType.driving );

	}

	getLowestLane ( type?: TvLaneType ): TvLane {

		const lanes = this.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => !type || lane.type == type );

		return this.findLowest( lanes, type );

	}

	getHighestLane ( type?: TvLaneType ): TvLane {

		const lanes = this.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => !type || lane.type == type );

		return this.findHighest( lanes, type );
	}

	getHighestDrivingLane (): TvLane {

		const lanes = this.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => lane.type == TvLaneType.driving );

		return this.findHighest( lanes );

	}

	isCarriageWayLane ( lane: TvLane ): boolean {

		return lane.type != TvLaneType.sidewalk && lane.type != TvLaneType.curb;

	}

	linkSuccessor ( laneSection: TvLaneSection, contact: TvContactPoint ): void {

		const sign = contact == TvContactPoint.START ? 1 : -1;

		this.getNonCenterLanes().forEach( lane => {
			lane.setOrUnsetSuccessor( laneSection.lanes.get( lane.id * sign ) );
		} );

		laneSection.getNonCenterLanes().forEach( lane => {
			if ( contact == TvContactPoint.START ) {
				lane.setOrUnsetPredecessor( this.lanes.get( lane.id * sign ) );
			} else {
				lane.setOrUnsetSuccessor( this.lanes.get( lane.id * sign ) );
			}
		} );

		this.syncWidthWithNextLane( laneSection, contact );

	}

	syncWidthWithNextLane ( laneSection: TvLaneSection, contact: TvContactPoint ): void {

		this.getNonCenterLanes().filter( lane => lane.successorExists ).forEach( lane => {

			if ( !laneSection.hasLane( lane.successorId ) ) return;

			const laneWidth = lane.getWidthValue( this.getLength() );
			const nextLane = laneSection.getLaneById( lane.successorId );
			const nextWidth = nextLane.getWidthValueAt( contact );

			if ( !Maths.approxEquals( laneWidth, nextWidth ) ) {
				lane.addWidthRecordAtEnd( nextWidth );
			}

			lane.updateWidthCoefficients();

		} );

	}

	linkPredecessor ( laneSection: TvLaneSection, contact: TvContactPoint ): void {

		const sign = contact == TvContactPoint.END ? 1 : -1;

		this.getNonCenterLanes().forEach( lane => {
			lane.setOrUnsetPredecessor( laneSection.lanes.get( lane.id * sign ) );
		} );

		laneSection.getNonCenterLanes().forEach( lane => {
			if ( contact == TvContactPoint.START ) {
				lane.setOrUnsetPredecessor( this.lanes.get( lane.id * sign ) );
			} else {
				lane.setOrUnsetSuccessor( this.lanes.get( lane.id * sign ) );
			}
		} )

		this.syncWidthWithPreviousSection( laneSection, contact );

	}

	syncWidthWithPreviousSection ( laneSection: TvLaneSection, contact: TvContactPoint ): void {

		this.getNonCenterLanes().filter( lane => lane.predecessorExists ).forEach( lane => {

			if ( !laneSection.hasLane( lane.predecessorId ) ) return;

			const laneWidth = lane.getWidthValue( 0 );
			const previousLane = laneSection.getLaneById( lane.predecessorId );
			const previousWidth = previousLane.getWidthValueAt( contact );

			if ( !Maths.approxEquals( laneWidth, previousWidth ) ) {
				lane.addWidthRecordAtStart( previousWidth );
			}

			lane.updateWidthCoefficients();

		} );

	}

	getOutgoingCoords ( contact: TvContactPoint, isCorner: boolean ): TvLaneCoord[] {

		const direction = LaneUtils.determineOutDirection( contact );

		const lanes = this.getLanes().filter( lane => lane.matchesDirection( direction ) );

		const coords = lanes.map( lane => {
			return new TvLaneCoord( this.road, this, lane, createLaneDistance( lane, contact ), 0 );
		} );

		if ( this.shouldSortOutgoing( contact, isCorner ) ) {
			// sort by lane id in ascending order
			coords.sort( ( a, b ) => a.lane.id - b.lane.id );
		}

		return coords;

	}

	private shouldSortOutgoing ( contact: TvContactPoint, isCorner: boolean ): boolean {

		if ( isCorner ) {
			return contact !== TvContactPoint.END;
		}

		return contact === TvContactPoint.END;
	}

	getIncomingCoords ( contact: TvContactPoint, isCorner: boolean ): TvLaneCoord[] {

		const direction = LaneUtils.determineDirection( contact );

		const lanes = this.getLanes().filter( lane => lane.matchesDirection( direction ) );

		const coords = lanes.map( lane => {
			return new TvLaneCoord( this.road, this, lane, createLaneDistance( lane, contact ), 0 );
		} );

		// sort by lane id in ascending order
		if ( this.shouldSortIncoming( contact, isCorner ) ) {
			coords.sort( ( a, b ) => a.lane.id - b.lane.id );
		}

		return coords;
	}

	private shouldSortIncoming ( contact: TvContactPoint, corner: boolean ): boolean {

		if ( corner ) {
			return contact === TvContactPoint.END;
		}

		return contact !== TvContactPoint.END;
	}

	getLeftMostIncomingLane ( contact: TvContactPoint ): TvLane | undefined {

		const direction = LaneUtils.determineDirection( contact );

		const lanes = this.getLanes().filter( lane => lane.matchesDirection( direction ) );

		if ( contact == TvContactPoint.START ) {

			return LaneUtils.findLowest( lanes, TvLaneType.driving );

		} else if ( contact == TvContactPoint.END ) {

			return LaneUtils.findHighest( lanes, TvLaneType.driving );

		}

	}

	getRightMostIncomingLane ( contact: TvContactPoint ): TvLane | undefined {

		const direction = LaneUtils.determineDirection( contact );

		const lanes = this.getLanes().filter( lane => lane.matchesDirection( direction ) );

		if ( contact == TvContactPoint.START ) {

			return LaneUtils.findHighest( lanes, TvLaneType.driving );

		} else if ( contact == TvContactPoint.END ) {

			return LaneUtils.findLowest( lanes, TvLaneType.driving );

		}

	}

	private findHighest ( lanes: TvLane[], type?: TvLaneType ): TvLane {

		if ( lanes.length === 0 ) return;

		let highestLaneId = Number.MIN_SAFE_INTEGER;
		let highestLane: TvLane = null;

		for ( const current of lanes ) {

			// ignore center lanes
			if ( current.isCenter ) continue;

			if ( type && current.type !== type ) continue;

			if ( current.id > highestLaneId ) {
				highestLane = current;
				highestLaneId = current.id;
			}

		}

		return highestLane;
	}

	private findLowest ( lanes: TvLane[], type?: TvLaneType ): TvLane {

		if ( lanes.length === 0 ) return;

		let lowestLaneId = Number.MAX_SAFE_INTEGER;
		let lowestLane: TvLane = null;

		for ( const current of lanes ) {

			// ignore center lanes
			if ( current.isCenter ) continue;

			if ( type && current.type != type ) continue;

			if ( current.id < lowestLaneId ) {
				lowestLane = current;
				lowestLaneId = current.id;
			}

		}

		return lowestLane;
	}

	getLanesBySide ( side: TvLaneSide ): TvLane[] {

		return this.getLanes().filter( lane => lane.side === side );

	}

	removePredecessorLinks (): void {
		this.getNonCenterLanes().forEach( lane => lane.unsetPredecessor() );
	}

	removeSuccessorLinks (): void {
		this.getNonCenterLanes().forEach( lane => lane.unsetSuccessor() );
	}
}

