/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { Copiable } from 'app/services/property-copy.service';
import { IHasUpdate } from 'app/commands/set-value-command';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { MathUtils } from 'three';
import { MeshGeometryData } from './mesh-geometry.data';
import { TravelDirection, TvColors, TvLaneSide, TvLaneType, TvRoadMarkTypes, TvRoadMarkWeights } from './tv-common';
import { TvLaneAccess } from './tv-lane-access';
import { TvLaneBorder } from './tv-lane-border';
import { TvLaneHeight } from './tv-lane-height';
import { TvLaneMaterial } from './tv-lane-material';
import { TvLaneRoadMark, TvRoadMarkLaneChange } from './tv-lane-road-mark';
import { TvLaneSection } from './tv-lane-section';
import { TvLaneSpeed } from './tv-lane-speed';
import { TvLaneVisibility } from './tv-lane-visibility';
import { TvLaneWidth } from './tv-lane-width';
import { TvUtils } from './tv-utils';
import { TrafficRule } from './traffic-rule';

export class TvLane implements ISelectable, Copiable, IHasUpdate {

	public readonly uuid: string;

	public gameObject: GameObject;

	public meshData: MeshGeometryData;

	public markMeshData: MeshGeometryData;

	public attr_id: number;

	private attr_type: TvLaneType;

	/**
	 * "true" = keep lane on level, .i.e. do not apply superelevation or crossfall
	 * "false" = apply superelevation and crossfall to this lane (default,
	 * also used if argument level is missing) lanes are also kept on level if
	 * the argument level is present but no superelevation or crossfall
	 * have been defined.
	 * default is false
	 */
	private attr_level: boolean = false;

	public width: TvLaneWidth[] = [];

	public borders: TvLaneBorder[] = [];

	public roadMark: TvLaneRoadMark[] = [];

	public material: TvLaneMaterial[] = [];

	public visibility: TvLaneVisibility[] = [];

	public speed: TvLaneSpeed[] = [];

	public access: TvLaneAccess[] = [];

	public height: TvLaneHeight[] = [];

	public isSelected: boolean;

	private travelDirection: TravelDirection;

	private _threeMaterialGuid: string;

	private _successor: number;

	private _roadId: number;

	private _side: TvLaneSide;

	private _predecessorExists: boolean;

	private _successorExists: boolean;

	private _predecessor: number;

	private _laneSection: TvLaneSection;

	constructor ( side: TvLaneSide, id: number, type: TvLaneType, level: boolean = false, roadId?: number, laneSection?: TvLaneSection ) {

		this._side = side;

		this.uuid = MathUtils.generateUUID();
		this.attr_id = id;
		this.attr_type = type;
		this.attr_level = level;
		this.roadId = roadId;
		this._laneSection = laneSection;

		if ( this.side === TvLaneSide.LEFT ) {
			this.travelDirection = TravelDirection.backward;
		} else if ( this.side === TvLaneSide.RIGHT ) {
			this.travelDirection = TravelDirection.forward;
		} else if ( this.side === TvLaneSide.CENTER ) {
			this.travelDirection = TravelDirection.undirected;
		} else {
			this.travelDirection = TravelDirection.undirected;
		}

	}

	get laneId (): number {
		return Number( this.attr_id );
	}

	set laneId ( value: number ) {
		this.attr_id = value;
	}

	get type (): TvLaneType {
		return this.attr_type;
	}

	set type ( value: TvLaneType ) {
		this.attr_type = value;
	}

	get level (): boolean {
		return this.attr_level;
	}

	set level ( value ) {
		this.attr_level = value;
	}

	get direction () {
		return this.travelDirection;
	}

	set direction ( value: TravelDirection ) {
		this.travelDirection = value;
	}

	get threeMaterialGuid (): string {
		return this._threeMaterialGuid;
	}

	set threeMaterialGuid ( value: string ) {
		this._threeMaterialGuid = value;
	}

	set successor ( laneId: number ) {
		this.setSuccessor( laneId );
	}

	get laneSection (): TvLaneSection {
		return this._laneSection;
	}

	set laneSection ( value: TvLaneSection ) {
		this._laneSection = value;
	}

	get roadId () {
		return this._roadId;
	}

	set roadId ( value ) {
		this._roadId = value;
	}

	get side (): TvLaneSide {
		return this._side;
	}

	get isLeft (): boolean {
		return this._side === TvLaneSide.LEFT;
	}

	get isRight (): boolean {
		return this._side === TvLaneSide.RIGHT;
	}

	get predecessorExists (): boolean {
		return this._predecessorExists;
	}

	set predecessorExists ( value: boolean ) {
		this._predecessorExists = value;
	}

	get successorExists (): boolean {
		return this._successorExists;
	}

	set successorExists ( value: boolean ) {
		this._successorExists = value;
	}

	get predecessor () {
		return this._predecessor || this.id;
	}

	set predecessor ( laneId: number ) {
		this.setPredecessor( laneId );
	}

	get laneSectionId () {
		return this._laneSection?.id;
	}

	get sideAsString (): string {

		switch ( this.side ) {

			case TvLaneSide.LEFT:
				return 'left';
				break;

			case TvLaneSide.CENTER:
				return 'center';
				break;

			case TvLaneSide.RIGHT:
				return 'right';
				break;

			default:
				break;
		}
	}

	get id (): number {
		return Number( this.attr_id );
	}

	set id ( value: number ) {
		this.attr_id = value;
	}

	get succcessor () {
		return this._successor || this.id;
	}

	set succcessor ( laneId: number ) {
		this.setPredecessor( laneId );
	}

	get inRoadDirection (): boolean {

		if ( this.laneSection.road.trafficRule == TrafficRule.RHT ) {

			return this.side === TvLaneSide.RIGHT;

		} else if ( this.laneSection.road.trafficRule == TrafficRule.LHT ) {

			return this.side === TvLaneSide.LEFT;

		}

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

	setSide ( side: TvLaneSide ) {
		this._side = side;
	}

	setId ( id: number ) {
		this.attr_id = id;
	}

	setType ( type: TvLaneType ) {
		this.attr_type = type;
	}

	setLevel ( level: boolean ) {
		this.attr_level = level;
	}

	setPredecessor ( laneId: number ) {

		this._predecessor = laneId;
		this._predecessorExists = true;

	}

	setSuccessor ( laneId: number ) {

		this._successor = laneId;
		this._successorExists = true;

	}

	removePredecessor () {

		this._predecessor = null;
		this._predecessorExists = false;

	}

	removeSuccessor () {

		this._successor = null;
		this._successorExists = false;

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

	getSide (): TvLaneSide {
		return this._side;
	}

	getId (): number {
		return Number( this.attr_id );
	}

	getType (): string {
		return this.attr_type;
	}

	getLevel (): boolean {
		return this.attr_level;
	}

	isPredecessorSet () {
		return this._predecessorExists;
	}

	getPredecessor () {
		return this._predecessor;
	}

	isSuccessorSet () {
		return this._successorExists;
	}

	getSuccessor () {
		return this._successor;
	}

	getLaneWidthVector (): TvLaneWidth[] {
		return this.width;
	}

	getLaneRoadMarkVector (): TvLaneRoadMark[] {
		return this.roadMark;
	}

	getLaneWidth ( index ): TvLaneWidth {

		if ( this.width.length > 0 && index < this.width.length ) {
			return this.width[ index ];
		}

		return null;
	}

	getLaneRoadMark ( index ): TvLaneRoadMark {

		if ( this.roadMark.length > 0 && index < this.roadMark.length ) {
			return this.roadMark[ index ];
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

	getLaneRoadMarkCount (): number {
		return this.roadMark.length;
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
	 * @param sCheck
	 */
	getHeightValue ( sCheck ): TvLaneHeight {

		const laneHeight = new TvLaneHeight( 0, 0, 0 );

		const index = this.checkLaneHeightInterval( sCheck );

		if ( index >= 0 ) {

			const currentHeight = this.getLaneHeight( index );

			laneHeight.setInner( currentHeight.getInner() );
			laneHeight.setOuter( currentHeight.getOuter() );

		}

		return laneHeight;
	}

	/**
	 * Evaluate the road marks records and return the road
	 * mark object corresponding to the provided s-offset
	 * @param sCheck
	 */
	getRoadMark ( sCheck ): TvLaneRoadMark {

		return TvUtils.checkIntervalArray( this.roadMark, sCheck );

		// if ( result == null ) {

		// 	console.warn( 'roadmark not found using default' );

		// 	result = new TvLaneRoadMark( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.WHITE, 0, TvRoadMarkLaneChange.NONE, 0, this );

		// }

		// return result;

		// const laneRoadMark = new OdLaneRoadMark( 0, OdRoadMarkTypes.SOLID, OdRoadMarkWeights.STANDARD, OdColors.WHITE, 0, '', 0 );
		//
		// const index = this.checkLaneRoadMarkInterval( sCheck );
		//
		// if ( index >= 0 ) {
		//
		//     const currentRoadMark = this.roadMark[ index ];
		//
		//     laneRoadMark.setType( currentRoadMark.getType() );
		//     laneRoadMark.setWeight( currentRoadMark.getWeight() );
		//     laneRoadMark.setMaterial( currentRoadMark.getMaterial() );
		//     laneRoadMark.setWidth( currentRoadMark.getWidth() );
		//     laneRoadMark.setHeight( currentRoadMark.getHeight() );
		//     laneRoadMark.setLaneChange( currentRoadMark.getLaneChange() );
		//
		// }
		//
		// return laneRoadMark;
	}

	// clones the entire lane
	clone ( id?: number ): TvLane {

		const laneId = id || this.id;

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this.roadId, this._laneSection );

		this.getLaneWidthVector().forEach( width => {
			newLane.addWidthRecordInstance( new TvLaneWidth( width.s, width.a, width.b, width.c, width.d, newLane ) );
		} );

		this.getLaneRoadMarkVector().forEach( roadMark => {
			newLane.addRoadMarkInstance( new TvLaneRoadMark(
				roadMark.sOffset, roadMark.type, roadMark.weight, roadMark.color,
				roadMark.width, roadMark.laneChange, roadMark.height, newLane
			) );
		} );

		return newLane;
	}

	// clones only the lane at s and avoid multiple entries for width, height etc
	cloneAtS ( id?: number, s?: number ): TvLane {

		const laneId = id || this.id;

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this.roadId, this._laneSection );

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

		return newLane;

	}

	getLaneWidthAt ( s: number ): TvLaneWidth {

		return TvUtils.checkIntervalArray( this.width, s );

	}

	getRoadMarkAt ( s: number ): TvLaneRoadMark {

		return TvUtils.checkIntervalArray( this.roadMark, s );

	}

	getRoadMarks () {

		return this.roadMark;

	}

	addRoadMarkInstance ( roadmark: TvLaneRoadMark ) {

		this.roadMark.push( roadmark );

		this.roadMark.sort( ( a, b ) => a.sOffset > b.sOffset ? 1 : -1 );

	}

	addWidthRecordInstance ( laneWidth: TvLaneWidth ) {

		this.width.push( laneWidth );

		this.width.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	removeWidthRecordInstance ( laneWidth: TvLaneWidth ) {

		this.width.splice( this.width.indexOf( laneWidth ), 1 );

		this.width.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	copyProperties?(): Object {

		return {
			travelDirection: this.travelDirection,
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

		this.roadMark.splice( this.roadMark.indexOf( roadmark ), 1 );

	}

	addBorder ( border: TvLaneBorder ) {

		this.borders.push( border );

	}

	removeBorder ( border: TvLaneBorder ) {

		this.borders.splice( this.borders.indexOf( border ), 1 );

	}

}

