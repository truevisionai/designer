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

export class TvLaneSection {

	public readonly id: number;
	public readonly uuid: string;

	public gameObject: GameObject;

	public attr_s: number;
	public attr_singleSide: boolean;
	// old property
	public lastSCoordinate: number;

	// public left: OdRoadLaneSectionContainer;
	// public center: OdRoadLaneSectionContainer;
	// public right: OdRoadLaneSectionContainer;
	private lastAddedLaneIndex: number;
	private laneMap: Map<number, TvLane> = new Map<number, TvLane>();
	private _road: TvRoad;

	constructor ( id: number, s: number, singleSide: boolean, road?: TvRoad ) {
		this.uuid = MathUtils.generateUUID();
		this.id = id;
		this.attr_s = s;
		this.attr_singleSide = singleSide;
		this._road = road;
	}

	private _length: number;

	get roadId () {
		return this._road?.id;
	}

	get length () {
		return this._length;
		// return this.lastSCoordinate - this.s;
	}

	set length ( value: number ) {
		this._length = value;
	}

	public get lanes () {
		return this.laneMap;
	}

	get s () {
		return this.attr_s;
	}

	get road (): TvRoad {
		return this._road;
	}

	set road ( value: TvRoad ) {
		this._road = value;
	}

	// private laneVector: OdLane[] = [];
	private get laneVector (): TvLane[] {
		return [ ...this.laneMap.values() ];
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

		const newLane = new TvLane( laneSide, id, type, level, this.roadId, this );

		this.addLaneInstance( newLane, sort );

		return newLane;

		// return;
		//
		// let counter = 0;
		//
		// if ( sort ) {
		//
		//     switch ( laneSide ) {
		//
		//         case LaneSide.RIGHT:
		//
		//             this.laneVector.push( new OdLane( laneSide, id, type, level, this.roadId ) );
		//
		//             this.lastAddedLaneIndex = this.laneVector.length - 1;
		//
		//             break;
		//
		//         case LaneSide.CENTER:
		//
		//             const size = this.getLaneCount();
		//
		//             if ( size > 0 ) {
		//
		//                 for ( let i = 0; i < size; i++ ) {
		//
		//                     if ( this.laneVector[ i ].getId() < 0 ) {
		//
		//                         counter = i;
		//
		//                         this.laneVector[ counter ] = new OdLane( laneSide, id, type, level, this.roadId );
		//
		//                         this.lastAddedLaneIndex = counter;
		//
		//                     }
		//
		//                 }
		//
		//             } else {
		//
		//                 counter = 0;
		//
		//                 this.laneVector.push( new OdLane( laneSide, id, type, level, this.roadId ) );
		//
		//                 this.lastAddedLaneIndex = counter;
		//             }
		//
		//             break;
		//
		//         case LaneSide.LEFT:
		//
		//             // add to the beginning of the array
		//             this.laneVector.unshift( new OdLane( laneSide, id, type, level, this.roadId ) );
		//
		//             this.lastAddedLaneIndex = counter;
		//
		//             break;
		//
		//     }
		// } else {
		//
		//     this.laneVector.push( new OdLane( laneSide, id, type, level, this.roadId ) );
		//
		//     this.lastAddedLaneIndex = this.laneVector.length - 1;
		//
		//     return this.lastAddedLaneIndex;
		// }
	}

	/**
	 * Delete lane at provided index
	 *
	 * @param index
	 */
	deleteLane ( index ) {
		this.laneVector.splice( index, 1 );
	}

	/**
	 * Delete the outside left lane
	 */
	deleteLeftLane () {

		// Remove first element of array
		this.laneVector.shift();
	}

	/**
	 * Delete the outside right lane
	 */
	deleteRightLane () {

		// Remove last element of array
		this.laneVector.pop();
	}

	getLastLane (): TvLane {

		if ( this.laneVector.length > 0 ) {
			return this.laneVector[ this.laneVector.length - 1 ];
		}

		return null;
	}

	getLastAddedLane (): TvLane {

		if ( this.laneMap.has( this.lastAddedLaneIndex ) ) {
			return this.laneMap.get( this.lastAddedLaneIndex );
		}

		// TODO : remove this
		if ( this.lastAddedLaneIndex < this.laneVector.length ) {
			return this.laneVector[ this.lastAddedLaneIndex ];
		}

		return null;
	}

	getLastLeftLane (): TvLane {

		if ( this.laneVector.length > 0 ) {

			if ( this.laneVector[ 0 ].getSide() === TvLaneSide.LEFT ) {

				return this.laneVector[ 0 ];

			} else {

				return null;
			}
		}

		return null;
	}

	getLastRightLane (): TvLane {

		if ( this.laneVector.length > 0 ) {

			const index = this.laneVector.length - 1;

			if ( this.laneVector[ index ].getSide() === TvLaneSide.RIGHT ) {

				return this.laneVector[ index ];

			} else {

				return null;
			}
		}

		return null;
	}

	getLastCenterLane (): TvLane {

		const size = this.getLaneCount();

		for ( let i = 0; i < size; i++ ) {

			if ( this.laneVector[ i ].getSide() === TvLaneSide.CENTER ) {

				return this.laneVector[ i ];

			}
		}

		return null;
	}

	getLane ( index ): TvLane {

		if ( this.laneVector.length > 0 && index < this.laneVector.length ) {
			return this.laneVector[ index ];
		}

		return null;
	}

	getLaneCount () {
		return this.laneVector.length;
	}

	getLaneVector () {
		return this.laneVector;
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

			if ( this.laneVector[ i ].getId() === 0 ) {

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

	getCenterLaneCount () {

		let count = 0;

		for ( let i = 0; i < this.getLaneCount(); i++ ) {

			if ( this.laneVector[ i ].getSide() === TvLaneSide.CENTER ) {

				count++;

			}
		}

		return count;
	}

	getCenterLanes () {

		return this.laneVector.filter( lane => lane.getSide() === TvLaneSide.CENTER );

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

		if ( this.laneVector.length > 0 ) {

			for ( let i = 0; i < this.laneVector.length; i++ ) {

				const element = this.laneVector[ i ];

				if ( element.getSide() === lane.getSide() ) {

					offsetFromCenter += element.getWidthValue( 0 );

				}
			}
		}

		return offsetFromCenter;
	}

	getLaneById ( laneId: number ): TvLane {

		let lane = null;

		if ( this.laneVector.length > 0 ) {

			for ( let i = 0; i < this.laneVector.length; i++ ) {

				const element = this.laneVector[ i ];

				if ( element.id === laneId ) {

					lane = element;
					break;

				}
			}
		}

		return lane;
	}

	addLaneInstance ( newLane: TvLane, sort: boolean ): void {

		if ( this.laneMap.has( newLane.id ) ) {

			const lanes = [ ...this.laneMap.entries() ];

			this.laneMap.clear();

			for ( let i = 0; i < lanes.length; i++ ) {

				const lane = lanes[ i ][ 1 ];

				// shift left lanes
				if ( lane.id >= newLane.id && newLane.id > 0 ) lane.setId( lane.id + 1 );

				// shift right lanes
				if ( lane.id <= newLane.id && newLane.id < 0 ) lane.setId( lane.id - 1 );

				this.laneMap.set( lane.id, lane );

			}

		}

		this.laneMap.set( newLane.id, newLane );

		this.lastAddedLaneIndex = newLane.id;

		if ( sort ) {

			const inDescOrder = ( a, b ) => a[ 1 ].id > b[ 1 ].id ? -1 : 1;

			this.laneMap = new Map( [ ...this.laneMap.entries() ].sort( inDescOrder ) );

		}
	}

	removeLaneById ( laneId: number ) {

		this.laneMap.delete( laneId );

		const inDescOrder = ( a, b ) => a[ 0 ] > b[ 0 ] ? -1 : 1;

		this.laneMap = new Map( [ ...this.laneMap.entries() ].sort( inDescOrder ) );

	}

	updateLaneWidthValues ( lane: TvLane ): void {

		const widthSections = lane.getLaneWidthVector();

		for ( let i = 0; i < widthSections.length; i++ ) {

			const current = widthSections[ i ];

			let pp0, pp1, pd0, pd1, length;

			if ( ( i + 1 ) < widthSections.length ) {

				const next = widthSections[ i + 1 ];

				// next s cannot be less than current so we need to clamp it
				if ( next.s <= current.s ) {

					next.s = current.s + 0.1;

				}

				length = next.s - current.s;

				pp0 = current.a;          // width at start
				pp1 = next.a;             // width at end
				pd0 = current.b;          // tangent at start
				pd1 = next.b;             // tangent at end

			} else {

				// take lane section length
				length = this.length - current.s;

				pp0 = current.a;          // width at start
				pp1 = current.a;          // width at end
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

	cloneAtS ( id?: number, s?: number, side?: boolean, road?: TvRoad ): TvLaneSection {

		const laneSection = new TvLaneSection( id || 0, s || this.s, side || this.attr_singleSide, road || this.road );

		this.laneMap.forEach( lane => {

			laneSection.laneMap.set( lane.id, lane.cloneAtS( lane.id, s || 0 ) );

		} );

		return laneSection;
	}
}
