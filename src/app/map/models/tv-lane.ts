/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/objects/game-object';
import { Copiable } from 'app/services/property-copy.service';
import { IHasUpdate } from 'app/commands/set-value-command';
import { ISelectable } from 'app/objects/i-selectable';
import { MathUtils } from 'three';
import { MeshGeometryData } from './mesh-geometry.data';
import { TravelDirection, TvColors, TvLaneSide, TvLaneType, TvRoadMarkTypes, TvRoadMarkWeights } from './tv-common';
import { TvLaneAccess } from './tv-lane-access';
import { TvLaneBorder } from './tv-lane-border';
import { TvLaneMaterial } from './tv-lane-material';
import { TvLaneRoadMark, TvRoadMarkLaneChange } from './tv-lane-road-mark';
import { TvLaneSection } from './tv-lane-section';
import { TvLaneSpeed } from './tv-lane-speed';
import { TvLaneVisibility } from './tv-lane-visibility';
import { TvLaneWidth } from './tv-lane-width';
import { TvUtils } from './tv-utils';
import { TvLaneHeight } from '../lane-height/lane-height.model';
import { OrderedMap } from "../../core/models/ordered-map";

export class TvLane implements ISelectable, Copiable, IHasUpdate {

	public readonly uuid: string;

	public gameObject: GameObject;

	public meshData: MeshGeometryData;

	/**
	 * +positive lane id for left lanes
	 * -negative lane id for right lanes
	 */
	public id: number;

	public type: TvLaneType;

	/**
	 * "true" = keep lane on level, .i.e. do not apply superelevation or crossfall
	 * "false" = apply superelevation and crossfall to this lane (default,
	 * also used if argument level is missing) lanes are also kept on level if
	 * the argument level is present but no superelevation or crossfall
	 * have been defined.
	 * default is false
	 */
	public level: boolean = false;

	public width: TvLaneWidth[] = [];

	public borders: TvLaneBorder[] = [];

	public roadMarks = new OrderedMap<TvLaneRoadMark>();

	public material: TvLaneMaterial[] = [];

	public visibility: TvLaneVisibility[] = [];

	public speed: TvLaneSpeed[] = [];

	public access: TvLaneAccess[] = [];

	public height: TvLaneHeight[] = [];

	public threeMaterialGuid: string;

	public side: TvLaneSide;

	public isSelected: boolean;

	public direction: TravelDirection;

	public roadId: number;

	public successorId: number;

	public predecessorId: number;

	get successorExists (): boolean {
		return this.successorId !== undefined && this.successorId !== null;
	}

	get predecessorExists (): boolean {
		return this.predecessorId !== undefined && this.predecessorId !== null;
	}

	private _laneSection: TvLaneSection;

	constructor ( side: TvLaneSide, id: number, type: TvLaneType, level: boolean = false, roadId?: number, laneSection?: TvLaneSection ) {

		this.side = side;

		this.uuid = MathUtils.generateUUID();
		this.id = id;
		this.type = type;
		this.level = level;
		this.roadId = roadId;
		this._laneSection = laneSection;

		if ( this.side === TvLaneSide.LEFT ) {
			this.direction = TravelDirection.backward;
		} else if ( this.side === TvLaneSide.RIGHT ) {
			this.direction = TravelDirection.forward;
		} else if ( this.side === TvLaneSide.CENTER ) {
			this.direction = TravelDirection.undirected;
		} else {
			this.direction = TravelDirection.undirected;
		}

	}

	toString () {
		return `Lane:${ this.id } Side:${ this.side } Type:${ this.type }`;
	}

	// // TODO: Fix this bug
	// set successor ( laneId: number ) {
	// 	this.setSuccessor( laneId );
	// }

	get laneSection (): TvLaneSection {
		return this._laneSection;
	}

	set laneSection ( value: TvLaneSection ) {
		this._laneSection = value;
	}

	get isLeft (): boolean {
		return this.side === TvLaneSide.LEFT;
	}

	get isRight (): boolean {
		return this.side === TvLaneSide.RIGHT;
	}

	get laneSectionId () {
		return this._laneSection?.id;
	}

	update (): void {

		//

	}

	select (): void {

		if ( this.isSelected ) return;

		this.isSelected = true;

		// const clone = ( this.gameObject.material as MeshStandardMaterial ).clone();

		// clone.emissive.set( COLOR.RED );

		// this.gameObject.material = clone;

	}

	unselect (): void {

		if ( !this.isSelected ) return;

		this.isSelected = false;

		// ( this.gameObject.material as MeshBasicMaterial )?.dispose();

		// this.gameObject.material = this.getThreeMaterial();

		// this.gameObject.material.needsUpdate = true;

	}

	highlight (): void {

		if ( this.isSelected ) return;

		// const orignal = this.gameObject.material as MeshStandardMaterial;

		// const clone = orignal.clone();

		// this.gameObject.material = clone;

		// clone.emissive.set( COLOR.GRAY );

		// // cache
		// this.gameObject.userData.material = orignal;

	}

	unhighlight (): void {

		if ( this.isSelected ) return;

		// const originalMaterial: MeshStandardMaterial = this.gameObject.userData.material;

		// if ( !originalMaterial ) return;

		// this.gameObject.material = originalMaterial;

		// this.gameObject.material.needsUpdate = true;

	}

	addWidthRecord ( s: number, a: number, b: number, c: number, d: number ) {

		return this.addWidthRecordInstance( new TvLaneWidth( s, a, b, c, d, this ) );

	}

	addRoadMarkRecord ( sOffset: number, type: TvRoadMarkTypes, weight: TvRoadMarkWeights, color: TvColors, width: number, laneChange: TvRoadMarkLaneChange, height: number ) {

		const roadMark = new TvLaneRoadMark( sOffset, type, weight, color, width, laneChange, height, this );

		this.addRoadMarkInstance( roadMark );

		return roadMark;
	}

	addNoneRoadMark ( s = 0 ) {

		return this.addRoadMarkRecord( s, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.WHITE, 0.0, TvRoadMarkLaneChange.NONE, 0.0 );

	}

	addRoadMarkOfType ( s = 0, type: TvRoadMarkTypes ) {

		return this.addRoadMarkRecord( s, type, TvRoadMarkWeights.STANDARD, TvColors.WHITE, 0.15, TvRoadMarkLaneChange.NONE, 0.0 );

	}

	addMaterialRecord ( sOffset: number, surface: string, friction: number, roughness: number ) {

		const index = this.checkLaneMaterialInterval( sOffset ) + 1;

		if ( index > this.getLaneMaterialCount() ) {

			this.material.push( new TvLaneMaterial( sOffset, surface, friction, roughness ) );

		} else {

			this.material[ index ] = ( new TvLaneMaterial( sOffset, surface, friction, roughness ) );

		}

	}

	//
	// DELETE METHODS
	//

	addVisibilityRecord ( sOffset: number, forward: number, back: number, left: number, right: number ) {

		const index = this.checkLaneVisibilityInterval( sOffset ) + 1;

		if ( index > this.getLaneVisibilityCount() ) {

			this.visibility.push( new TvLaneVisibility( sOffset, forward, back, left, right ) );

		} else {

			this.visibility[ index ] = new TvLaneVisibility( sOffset, forward, back, left, right );

		}

		return index;

	}

	addSpeedRecord ( sOffset: number, max: number, unit: string ) {

		const index = this.checkLaneSpeedInterval( sOffset ) + 1;

		if ( index > this.getLaneSpeedCount() ) {

			this.speed.push( new TvLaneSpeed( sOffset, max, unit ) );

		} else {

			this.speed[ index ] = new TvLaneSpeed( sOffset, max, unit );

		}

		return index;
	}

	addAccessRecord ( sOffset: number, restriction: string ) {

		const index = this.checkLaneAccessInterval( sOffset ) + 1;

		if ( index > this.getLaneAccessCount() ) {

			this.access.push( new TvLaneAccess( sOffset, restriction ) );

		} else {

			this.access[ index ] = new TvLaneAccess( sOffset, restriction );

		}

		return index;
	}

	addHeightRecord ( sOffset: number, inner: number, outer: number ) {

		const index = this.checkLaneHeightInterval( sOffset ) + 1;

		if ( index > this.getLaneHeightCount() ) {

			this.height.push( new TvLaneHeight( sOffset, inner, outer ) );

		} else {

			this.height[ index ] = new TvLaneHeight( sOffset, inner, outer );

		}

		return index;
	}

	clearLaneHeight () {
		this.height.splice( 0, this.height.length );
	}

	getLaneWidthVector (): TvLaneWidth[] {
		return this.width;
	}

	getLaneWidth ( index ): TvLaneWidth {

		if ( this.width.length > 0 && index < this.width.length ) {
			return this.width[ index ];
		}

		return null;
	}

	getLaneMaterial ( index ): TvLaneMaterial {

		if ( this.material.length > 0 && index < this.material.length ) {
			return this.material[ index ];
		}

		return null;
	}

	getLaneVisibility ( index ): TvLaneVisibility {

		if ( this.visibility.length > 0 && index < this.visibility.length ) {
			return this.visibility[ index ];
		}

		return null;
	}

	getLaneSpeed ( index ): TvLaneSpeed {

		if ( this.speed.length > 0 && index < this.speed.length ) {
			return this.speed[ index ];
		}

		return null;
	}

	getLaneAccess ( index ): TvLaneAccess {

		if ( this.access.length > 0 && index < this.access.length ) {
			return this.access[ index ];
		}

		return null;
	}

	getLaneHeight ( index ): TvLaneHeight {

		if ( this.height.length > 0 && index < this.height.length ) {
			return this.height[ index ];
		}

		return null;
	}

	getLaneWidthCount (): number {
		return this.width.length;
	}

	getLaneMaterialCount (): number {
		return this.material.length;
	}

	getLaneVisibilityCount (): number {
		return this.visibility.length;
	}

	getLaneSpeedCount (): number {
		return this.speed.length;
	}

	getLaneAccessCount (): number {
		return this.access.length;
	}

	getLaneHeightCount (): number {
		return this.height.length;
	}

	checkLaneMaterialInterval ( sCheck: number ): number {

		let res = -1;

		for ( let i = 0; i < this.material.length; i++ ) {

			if ( sCheck >= this.material[ i ].sOffset ) {

				res = i;

			} else {

				break;

			}

		}

		return res;
	}

	checkLaneVisibilityInterval ( sCheck: number ): number {

		let res = -1;

		for ( let i = 0; i < this.visibility.length; i++ ) {

			if ( sCheck >= this.visibility[ i ].sOffset ) {

				res = i;

			} else {

				break;

			}

		}

		return res;
	}

	checkLaneSpeedInterval ( sCheck: number ): number {

		let res = -1;

		for ( let i = 0; i < this.speed.length; i++ ) {

			if ( sCheck >= this.speed[ i ].sOffset ) {

				res = i;

			} else {

				break;

			}

		}

		return res;
	}

	checkLaneAccessInterval ( sCheck: number ): number {

		let res = -1;

		for ( let i = 0; i < this.access.length; i++ ) {

			if ( sCheck >= this.access[ i ].sOffset ) {

				res = i;

			} else {

				break;

			}

		}

		return res;
	}

	checkLaneHeightInterval ( s_value: number ): number {

		let res = -1;

		for ( let i = 0; i < this.height.length; i++ ) {

			if ( s_value >= this.height[ i ].sOffset ) {

				res = i;

			} else {

				break;

			}

		}

		return res;
	}

	/**
	 * Evaluate the record and the return the width value
	 * @param sCheck
	 */
	getWidthValue ( sCheck ): number {

		const widthEntry = this.getLaneWidthAt( sCheck );

		if ( widthEntry == null ) return 0;

		return widthEntry.getValue( sCheck );
	}

	/**
	 * Evaluate the record and return the height object
	 * @param sOffset
	 */
	getHeightValue ( sOffset: number ): TvLaneHeight {

		const laneHeight = new TvLaneHeight( sOffset, 0, 0 );

		const index = this.checkLaneHeightInterval( sOffset );

		if ( index >= 0 ) {

			const currentHeight = this.getLaneHeight( index );

			laneHeight.inner = currentHeight.inner;
			laneHeight.outer = currentHeight.outer;

		}

		return laneHeight;
	}

	/**
	 * Evaluate the road marks records and return the road
	 * mark object corresponding to the provided s-offset
	 * @param sCheck
	 */
	getRoadMark ( sCheck ): TvLaneRoadMark {

		return this.roadMarks.findAt( sCheck );

	}

	// clones the entire lane
	clone ( id?: number ): TvLane {

		const laneId = id || this.id;

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this.roadId, this._laneSection );

		this.getLaneWidthVector().forEach( width => {
			newLane.addWidthRecordInstance( new TvLaneWidth( width.s, width.a, width.b, width.c, width.d, newLane ) );
		} );

		this.roadMarks.forEach( roadMark => {
			const clone = roadMark.clone( roadMark.sOffset, newLane );
			newLane.roadMarks.set( clone.s, clone );
		} );

		return newLane;
	}

	// clones only the lane at s and avoid multiple entries for width, height etc
	cloneAtS ( id?: number, s?: number ): TvLane {

		const laneId = id || this.id;

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this.roadId, this._laneSection );

		newLane.direction = this.direction;
		newLane.threeMaterialGuid = this.threeMaterialGuid;

		const width = this.getLaneWidthAt( s || 0 );

		if ( width ) {

			newLane.addWidthRecord( width.s, width.a, width.b, width.c, width.d );

		}

		const roadMark = this.getRoadMark( s || 0 );

		if ( roadMark ) {

			newLane.addRoadMarkRecord(
				roadMark.sOffset,
				roadMark.type,
				roadMark.weight,
				roadMark.color,
				roadMark.width,
				roadMark.laneChange,
				roadMark.height
			);

		}

		const height = this.getHeightValue( s || 0 );

		if ( height ) newLane.addHeightRecord( height.sOffset, height.inner, height.outer );

		return newLane;

	}

	getLaneWidthAt ( s: number ): TvLaneWidth {

		return TvUtils.checkIntervalArray( this.width, s );

	}

	getRoadMarkAt ( s: number ): TvLaneRoadMark {

		return this.roadMarks.findAt( s );

	}

	addRoadMarkInstance ( roadmark: TvLaneRoadMark ) {

		this.roadMarks.set( roadmark.s, roadmark );

	}

	addWidthRecordInstance ( laneWidth: TvLaneWidth ) {

		this.width.push( laneWidth );

		this.width.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	removeWidthRecordInstance ( laneWidth: TvLaneWidth ) {

		this.width.splice( this.width.indexOf( laneWidth ), 1 );

		this.width.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	copyProperties? (): Object {

		return {
			travelDirection: this.direction,
			type: this.type,
			level: this.level,
		};
	}

	getReferenceLinePoints ( location: 'start' | 'center' | 'end' ) {

		const points = [];

		const offset = this.side === TvLaneSide.LEFT ? 1 : -1;

		let t = 0;

		for ( let s = this.laneSection.s; s < this.laneSection.endS; s++ ) {

			if ( location === 'center' ) {

				t = this.laneSection.getWidthUptoCenter( this, s - this.laneSection.s );

			} else if ( location === 'end' ) {

				t = this.laneSection.getWidthUptoEnd( this, s - this.laneSection.s );

			}

			points.push( this.laneSection.road.getPosThetaAt( s, t * offset ) );

		}

		return points;
	}

	removeRoadMark ( roadmark: TvLaneRoadMark ) {

		this.roadMarks.remove( roadmark );

	}

	addBorder ( border: TvLaneBorder ) {

		this.borders.push( border );

	}

	static stringToType ( type: string ): TvLaneType {

		if ( type === 'bidirectional' ) return TvLaneType.bidirectional;
		if ( type === 'driving' ) return TvLaneType.driving;
		if ( type === 'stop' ) return TvLaneType.stop;
		if ( type === 'shoulder' ) return TvLaneType.shoulder;
		if ( type === 'restricted' ) return TvLaneType.restricted;
		if ( type === 'median' ) return TvLaneType.median;
		if ( type === 'special1' ) return TvLaneType.special1;
		if ( type === 'special2' ) return TvLaneType.special2;
		if ( type === 'special3' ) return TvLaneType.special3;
		if ( type === 'roadWorks' ) return TvLaneType.roadWorks;
		if ( type === 'tram' ) return TvLaneType.tram;
		if ( type === 'rail' ) return TvLaneType.rail;
		if ( type === 'entry' ) return TvLaneType.entry;
		if ( type === 'exit' ) return TvLaneType.exit;
		if ( type === 'offRamp' ) return TvLaneType.offRamp;
		if ( type === 'onRamp' ) return TvLaneType.onRamp;
		if ( type === 'connectingRamp' ) return TvLaneType.connectingRamp;
		if ( type === 'bus' ) return TvLaneType.bus;
		if ( type === 'taxi' ) return TvLaneType.taxi;
		if ( type === 'HOV' ) return TvLaneType.HOV;
		if ( type === 'sidewalk' ) return TvLaneType.sidewalk;
		if ( type === 'walking' ) return TvLaneType.sidewalk;
		if ( type === 'biking' ) return TvLaneType.biking;
		if ( type === 'border' ) return TvLaneType.border;
		if ( type === 'curb' ) return TvLaneType.curb;
		if ( type === 'parking' ) return TvLaneType.parking;
		if ( type === 'slipLane' ) return TvLaneType.slipLane;
		if ( type === 'shared' ) return TvLaneType.shared;
		if ( type === 'none' ) return TvLaneType.none;

		return TvLaneType.none;

	}

	static typeToString ( type: TvLaneType ): string {

		if ( type === TvLaneType.bidirectional ) return 'bidirectional';
		if ( type === TvLaneType.driving ) return 'driving';
		if ( type === TvLaneType.stop ) return 'stop';
		if ( type === TvLaneType.shoulder ) return 'shoulder';
		if ( type === TvLaneType.restricted ) return 'restricted';
		if ( type === TvLaneType.median ) return 'median';
		if ( type === TvLaneType.special1 ) return 'special1';
		if ( type === TvLaneType.special2 ) return 'special2';
		if ( type === TvLaneType.special3 ) return 'special3';
		if ( type === TvLaneType.roadWorks ) return 'roadWorks';
		if ( type === TvLaneType.tram ) return 'tram';
		if ( type === TvLaneType.rail ) return 'rail';
		if ( type === TvLaneType.entry ) return 'entry';
		if ( type === TvLaneType.exit ) return 'exit';
		if ( type === TvLaneType.offRamp ) return 'offRamp';
		if ( type === TvLaneType.onRamp ) return 'onRamp';
		if ( type === TvLaneType.connectingRamp ) return 'connectingRamp';
		if ( type === TvLaneType.bus ) return 'bus';
		if ( type === TvLaneType.taxi ) return 'taxi';
		if ( type === TvLaneType.HOV ) return 'HOV';
		if ( type === TvLaneType.sidewalk ) return 'sidewalk';
		if ( type === TvLaneType.biking ) return 'biking';
		if ( type === TvLaneType.border ) return 'border';
		if ( type === TvLaneType.curb ) return 'curb';
		if ( type === TvLaneType.parking ) return 'parking';
		if ( type === TvLaneType.none ) return 'none';

		return 'none';

	}
}

