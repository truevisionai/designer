/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { Debug } from 'app/core/utils/debug';
import { MathUtils } from 'three';
import { TvLaneSide, TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvLaneHeight } from './tv-lane-height';
import { TvLaneRoadMark } from './tv-lane-road-mark';
import { TvLaneSectionSample } from './tv-lane-section-sample';
import { TvRoad } from './tv-road.model';
import { TvUtils } from './tv-utils';

export class TvLaneSection {

	public readonly id: number;
	public readonly uuid: string;

	public gameObject: GameObject;

	public attr_s: number;
	public attr_singleSide: boolean;
	// old property
	public endS: number;

	// public left: OdRoadLaneSectionContainer;
	// public center: OdRoadLaneSectionContainer;
	// public right: OdRoadLaneSectionContainer;
	private lastAddedLaneIndex: number;

	private _laneMap: Map<number, TvLane> = new Map<number, TvLane>();

	private _length: number;

	constructor ( id: number, s: number, singleSide: boolean, public road: TvRoad ) {
		this.uuid = MathUtils.generateUUID();
		this.id = id;
		this.attr_s = s;
		this.attr_singleSide = singleSide;
	}

	get laneMap (): Map<number, TvLane> {
		return this._laneMap;
	}

	set laneMap ( value: Map<number, TvLane> ) {
		this._laneMap = value;
	}

	get length () {
		return this._length;
		// return this.lastSCoordinate - this.s;
	}

	set length ( value: number ) {
		this._length = value;
	}

	get roadId () {
		return this.road?.id;
	}

	public get lanes () {
		return this.laneMap;
	}

	get s () {
		return this.attr_s;
	}

	// private laneVector: OdLane[] = [];
	private get laneArray (): TvLane[] {
		return [ ...this.laneMap.values() ];
	}

	hasLaneId ( laneId: number ) {

		return this.laneMap.has( laneId );

	}

	updateMeshGeometry ( offset: number ): any {

		this.getLeftLanes().reverse().forEach( ( lane, i ) => {

			Debug.log( i, lane );

		} );


	}

	getWidthUptoStart ( lane: TvLane, sCoordinate: number ): number {

		let width = 0;
		let lanes: TvLane[] = [];

		if ( lane.side == TvLaneSide.RIGHT ) {

			lanes = this.getRightLanes();

		} else if ( lane.side == TvLaneSide.LEFT ) {

			lanes = this.getLeftLanes().reverse();

		} else {

			width = 0;

			return width;

		}

		for ( let i = 0; i < lanes.length; i++ ) {

			// TODO: Check if this correct

			var element = lanes[ i ];

			if ( element.id == lane.id ) break;

			width += element.getWidthValue( sCoordinate );
		}

		// console.log(`upto-start lane-id: ${lane.id} s: ${sCoordinate} width: ${width}`);

		return width;

	}

	getWidthUptoEnd ( lane: TvLane, sCoordinate: number ): number {

		let width = 0;
		let lanes: TvLane[] = [];

		if ( lane.side == TvLaneSide.RIGHT ) {

			lanes = this.getRightLanes();

		} else if ( lane.side == TvLaneSide.LEFT ) {

			lanes = this.getLeftLanes().reverse();

		} else {

			return width = 0;

		}

		for ( let i = 0; i < lanes.length; i++ ) {

			// TODO: Check if this correct

			var element = lanes[ i ];

			width += element.getWidthValue( sCoordinate );

			if ( element.id == lane.id ) break;
		}

		// console.log(`upto-end lane-id: ${lane.id} s: ${sCoordinate} width: ${width}`);

		return width;

	}

	getWidthUptoCenter ( lane: TvLane, sCoordinate: number ): number {

		let cumulativeWidth = 0;
		let lanes: TvLane[] = [];

		if ( lane.side == TvLaneSide.RIGHT ) {

			lanes = this.getRightLanes();

		} else if ( lane.side == TvLaneSide.LEFT ) {

			lanes = this.getLeftLanes().reverse();

		} else {

			return 0;
		}

		for ( let i = 0; i < lanes.length; i++ ) {

			let element = lanes[ i ];

			let width = element.getWidthValue( sCoordinate );

			cumulativeWidth += width;

			if ( element.id == lane.id ) {

				cumulativeWidth -= width / 2;
				break;
			}
		}

		return cumulativeWidth;

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
	addLane ( laneSide: TvLaneSide, id: number, type: TvLaneType, level: boolean, sort: boolean ) {

		const newLane = new TvLane( laneSide, id, type, level, this.road?.id, this );

		this.addLaneInstance( newLane, sort );

		return newLane;
	}

	/**
	 * Delete the outside left lane
	 */
	deleteLeftLane () {

		// Remove first element of array
		this.laneArray.shift();

		return this;
	}

	/**
	 * Delete the outside right lane
	 */
	deleteRightLane () {

		// Remove last element of array
		this.laneArray.pop();

		return this;
	}

	getLastLane (): TvLane {

		if ( this.laneArray.length > 0 ) {
			return this.laneArray[ this.laneArray.length - 1 ];
		}

		return null;
	}

	getLastAddedLane (): TvLane {

		if ( this.laneMap.has( this.lastAddedLaneIndex ) ) {
			return this.laneMap.get( this.lastAddedLaneIndex );
		}

		// TODO : remove this
		if ( this.lastAddedLaneIndex < this.laneArray.length ) {
			return this.laneArray[ this.lastAddedLaneIndex ];
		}

		return null;
	}

	getLastLeftLane (): TvLane {

		if ( this.laneArray.length > 0 ) {

			if ( this.laneArray[ 0 ].getSide() === TvLaneSide.LEFT ) {

				return this.laneArray[ 0 ];

			} else {

				return null;
			}
		}

		return null;
	}

	getLastRightLane (): TvLane {

		if ( this.laneArray.length > 0 ) {

			const index = this.laneArray.length - 1;

			if ( this.laneArray[ index ].getSide() === TvLaneSide.RIGHT ) {

				return this.laneArray[ index ];

			} else {

				return null;
			}
		}

		return null;
	}

	getLastCenterLane (): TvLane {

		const size = this.getLaneCount();

		for ( let i = 0; i < size; i++ ) {

			if ( this.laneArray[ i ].getSide() === TvLaneSide.CENTER ) {

				return this.laneArray[ i ];

			}
		}

		return null;
	}

	getLane ( index ): TvLane {

		if ( this.laneArray.length > 0 && index < this.laneArray.length ) {
			return this.laneArray[ index ];
		}

		return null;
	}

	getLaneCount () {
		return this.laneArray.length;
	}

	getLaneArray () {
		return this.laneArray;
	}

	/**
	 * Get the lane section s-offset
	 */
	getS () {
		return this.attr_s;
	}

	setS ( value ) {
		this.attr_s = value;
	}

	/**
	 * Get the lane section final s-offset which is the
	 * s-offset of the last record of the lane section
	 */
	getS2 () {

		let maxSValue = 0;

		const size = this.getLaneCount();

		for ( let i = 0; i < size; i++ ) {

			const lane = this.getLane( i );

			const width = lane.getLaneWidth( i );
			if ( width != null ) {
				if ( width.s > maxSValue ) {
					maxSValue = width.s;
				}
			}

			const roadMark = lane.getLaneRoadMark( i );
			if ( roadMark != null ) {
				if ( roadMark.sOffset > maxSValue ) {
					maxSValue = roadMark.sOffset;
				}
			}

			const material = lane.getLaneMaterial( i );
			if ( material != null ) {
				if ( material.sOffset > maxSValue ) {
					maxSValue = material.sOffset;
				}
			}

			const visibility = lane.getLaneVisibility( i );
			if ( visibility != null ) {
				if ( visibility.sOffset > maxSValue ) {
					maxSValue = visibility.sOffset;
				}
			}

			const speed = lane.getLaneSpeed( i );
			if ( speed != null ) {
				if ( speed.sOffset > maxSValue ) {
					maxSValue = speed.sOffset;
				}
			}

			const access = lane.getLaneAccess( i );
			if ( access != null ) {
				if ( access.sOffset > maxSValue ) {
					maxSValue = access.sOffset;
				}
			}

			const height = lane.getLaneHeight( i );
			if ( height != null ) {
				if ( height.sOffset > maxSValue ) {
					maxSValue = height.sOffset;
				}
			}
		}

		return this.getS() + maxSValue;
	}

	/**
	 * Check if the tested s-offset is inside the lane section interval
	 * @param sCheck A double s-offset value that has to be checked
	 * @returns {boolean} Return true if the s-offset value belongs to current lane section, false otherwise
	 */
	checkInterval ( sCheck ): boolean {

		if ( sCheck >= this.attr_s ) {
			return true;
		}

		return false;
	}

	/**
	 * Return the lane-0 index in the lanes vector
	 */
	getZeroLaneIndex () {

		for ( let i = 0; i < this.getLaneCount(); i++ ) {

			if ( this.laneArray[ i ].getId() === 0 ) {

				return i;

			}

		}

		return 0;
	}

	getLeftLaneCount () {

		const idGreaterThanZero = ( a, b ) => a[ 0 ] > 0;

		const leftLanes = new Map( [ ...this.laneMap.entries() ].filter( idGreaterThanZero ) );

		return leftLanes.size;

		// let count = 0;
		//
		// for ( let i = 0; i < this.getLaneCount(); i++ ) {
		//
		//     if ( this.laneVector[ i ].getSide() === LaneSide.LEFT ) {
		//
		//         count++;
		//
		//     }
		// }
		//
		// return count;
	}

	getLeftLanes (): TvLane[] {

		const idGreaterThanZero = ( a, b ) => a[ 0 ] > 0;

		const leftLanes = new Map( [ ...this.laneMap.entries() ].filter( idGreaterThanZero ) );

		return [ ...leftLanes.values() ];

		// const lanes = [];
		//
		// for ( let i = 0; i < this.getLaneCount(); i++ ) {
		//
		//     if ( this.laneVector[ i ].getSide() === LaneSide.LEFT ) {
		//
		//         lanes.push( this.laneVector[ i ] );
		//
		//     }
		// }
		//
		// return lanes;
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

	getCenterLaneCount () {

		let count = 0;

		for ( let i = 0; i < this.getLaneCount(); i++ ) {

			if ( this.laneArray[ i ].getSide() === TvLaneSide.CENTER ) {

				count++;

			}
		}

		return count;
	}

	getCenterLanes () {

		return this.laneArray.filter( lane => lane.getSide() === TvLaneSide.CENTER );

	}

	getRightLaneCount () {

		const idLessThanZero = ( a, b ) => a[ 0 ] < 0;

		const rightLanes = new Map( [ ...this.laneMap.entries() ].filter( idLessThanZero ) );

		return rightLanes.size;

		// let count = 0;
		//
		// for ( let i = 0; i < this.getLaneCount(); i++ ) {
		//
		//     if ( this.laneVector[ i ].getSide() === LaneSide.RIGHT ) {
		//
		//         count++;
		//
		//     }
		// }
		//
		// return count;
	}

	getRightLanes (): TvLane[] {

		const idLessThanZero = ( a, b ) => a[ 0 ] < 0;

		const rightLanes = new Map( [ ...this.laneMap.entries() ].filter( idLessThanZero ) );

		return [ ...rightLanes.values() ];

		// const lanes = [];
		//
		// for ( let i = 0; i < this.getLaneCount(); i++ ) {
		//
		//     if ( this.laneVector[ i ].getSide() === LaneSide.RIGHT ) {
		//
		//         lanes.push( this.laneVector[ i ] );
		//
		//     }
		// }
		//
		// return lanes;
	}

	/**
	 * Fill a special structure with all the lane / lane section data that is sampled at a provided s-offset position along the road
	 * @param sCheck s-offset along the road at which to sample the lane section
	 * @param laneSectionSample The structure that has to be filled with the sampled data
	 * @return Returns true if the operation was successful.
	 */
	fillLaneSectionSample ( sCheck: number, laneSectionSample: TvLaneSectionSample ) {

		laneSectionSample.clearVectors();


		const leftMax = 0;
		const rightMax = this.getLaneCount() - 1;

		sCheck -= this.getS();

		let level: boolean;
		let type: string;
		let height: TvLaneHeight;
		let roadMark: TvLaneRoadMark;
		let width = 0;

		if ( this.getLeftLaneCount() > 0 ) {

			const zeroLaneIndex = this.getZeroLaneIndex();

			for ( let i = zeroLaneIndex; i >= leftMax; i-- ) {

				const lane = this.getLane( i );

				type = lane.getType();
				level = lane.getLevel();
				height = lane.getHeightValue( sCheck );
				roadMark = lane.getRoadMark( sCheck );
				width = lane.getWidthValue( sCheck );          // and accumulate the width

				laneSectionSample.addLeftRecord( type, width, height, roadMark, level );
			}
		}

		if ( this.getRightLaneCount() > 0 ) {

			for ( let i = this.getZeroLaneIndex(); i <= rightMax; i++ ) {

				const lane = this.getLane( i );

				type = lane.getType();
				level = lane.getLevel();
				height = lane.getHeightValue( sCheck );
				roadMark = lane.getRoadMark( sCheck );
				width = lane.getWidthValue( sCheck );

				laneSectionSample.addRightRecord( type, width, height, roadMark, level );

			}
		}

		return true;
	}

	getLaneOffset ( lane: TvLane ) {

		let offsetFromCenter = 0;

		if ( this.laneArray.length > 0 ) {

			for ( let i = 0; i < this.laneArray.length; i++ ) {

				const element = this.laneArray[ i ];

				if ( element.getSide() === lane.getSide() ) {

					offsetFromCenter += element.getWidthValue( 0 );

				}
			}
		}

		return offsetFromCenter;
	}

	getLaneById ( laneId: number ): TvLane {

		let lane = null;

		if ( this.laneArray.length > 0 ) {

			for ( let i = 0; i < this.laneArray.length; i++ ) {

				const element = this.laneArray[ i ];

				if ( element.id === laneId ) {

					lane = element;
					break;

				}
			}
		}

		return lane;
	}

	addLaneInstance ( newLane: TvLane, sort: boolean = true ): void {

		if ( this.laneMap.has( newLane.id ) ) {

			const lanes = [ ...this.laneMap.entries() ];

			this.laneMap.clear();

			for ( let [ id, lane ] of lanes ) {

				// shift left lanes
				if ( id >= newLane.id && newLane.id > 0 ) lane.setId( lane.id + 1 );

				// shift right lanes
				if ( id <= newLane.id && newLane.id < 0 ) lane.setId( lane.id - 1 );

				this.laneMap.set( lane.id, lane );

			}

		}

		this.laneMap.set( newLane.id, newLane );

		this.lastAddedLaneIndex = newLane.id;

		if ( sort ) this.sortLanes();
	}

	sortLanes () {

		const inDescOrder = ( a: [ number, TvLane ], b: [ number, TvLane ] ) => a[ 1 ].id > b[ 1 ].id ? -1 : 1;

		this.laneMap = new Map( [ ...this.laneMap.entries() ].sort( inDescOrder ) );

	}

	getRightMostLane (): TvLane {

		return this.laneArray[ this.laneArray.length - 1 ];

	}

	getLeftMostLane (): TvLane {

		return this.laneArray[ 0 ];

	}

	removeLane ( deletedLane: TvLane ) {

		if ( !this.laneMap.has( deletedLane.id ) ) {
			console.warn( 'Lane not found' );
			return;
		}

		this.laneMap.delete( deletedLane.id );

		const lanes = [ ...deletedLane.laneSection.laneMap.entries() ];

		this.laneMap.clear();

		// create a new map
		let newLaneMap = new Map<number, TvLane>();

		// iterate through the old map
		for ( let [ id, lane ] of lanes ) {

			// shift left lanes
			if ( id > deletedLane.id && deletedLane.id > 0 ) lane.setId( id - 1 );

			// shift right lanes
			if ( id < deletedLane.id && deletedLane.id < 0 ) lane.setId( id + 1 );

			newLaneMap.set( lane.id, lane );

		}

		this.laneMap = newLaneMap;

		this.sortLanes()

	}

	updateLaneWidthValues ( lane: TvLane ): void {

		// TODO: Check if this is correct
		// this.length = lane.s - this.s;
		// this.length - lane.s;
		TvUtils.computeCoefficients( lane.getLaneWidthVector(), this.length );

	}

	findNearestLane ( s: number, t: number, location: 'start' | 'center' | 'end' ): TvLane {

		const lanes = t > 0 ? this.getLeftLanes() : this.getRightLanes();

		if ( this.laneMap.has( 0 ) ) lanes.push( this.laneMap.get( 0 ) );

		// we need to find the lane which is closest to the pointer
		const THRESHOLD = 0.5;

		let minDistance = Infinity;

		let targetLane: TvLane;

		for ( const lane of lanes ) {

			let laneT: number;

			if ( location === 'center' ) {

				laneT = this.getWidthUptoCenter( lane, s );

			} else if ( location === 'end' ) {

				laneT = this.getWidthUptoEnd( lane, s );

			}

			const distance = Math.abs( laneT - Math.abs( t ) );

			// if ( this.debug ) console.log( lane.id, laneT, t, distance < THRESHOLD );

			if ( distance < minDistance && distance < THRESHOLD ) {
				minDistance = distance;
				targetLane = lane;
			}

		}

		return targetLane;
	}

	getLaneAt ( s: number, t: number ): TvLane {

		const lanes = this.lanes;

		const isLeft = t > 0;
		const isRight = t < 0;

		if ( Math.abs( t ) < 0.1 ) {
			return this.getLaneById( 0 );
		}

		for ( const [ id, lane ] of lanes ) {

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

		const laneSection = new TvLaneSection( id || 0, s || this.s, side || this.attr_singleSide, road || this.road );

		this.laneMap.forEach( lane => {

			laneSection.laneMap.set( lane.id, lane.cloneAtS( lane.id, s || 0 ) );

		} );

		return laneSection;
	}

	removeLeftLanes () {

		const lanes = this.getLeftLanes();

		lanes.forEach( lane => {

			this.removeLane( lane );

		} );

	}

	removeRightLanes () {

		const lanes = this.getRightLanes();

		lanes.forEach( lane => {

			this.removeLane( lane );

		} );

	}

	toString () {

		return `LaneSection: id: ${this.id} s: ${this.s} laneCount: ${this.getLaneCount()}`;

	}
}
