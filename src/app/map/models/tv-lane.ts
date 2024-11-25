/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/objects/game-object';
import { Copiable } from 'app/services/property-copy.service';
import { IHasUpdate } from 'app/commands/set-value-command';
import { ISelectable } from 'app/objects/i-selectable';
import { MathUtils } from 'three';
import { MeshGeometryData } from './mesh-geometry.data';
import {
	TravelDirection,
	TvColors,
	TvContactPoint,
	TvLaneSide,
	TvLaneType,
	TvRoadMarkTypes,
	TvRoadMarkWeights
} from './tv-common';
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
import { TvRoad } from './tv-road.model';
import { TvLaneCoord } from './tv-lane-coord';
import { createLaneDistance } from '../road/road-distance';
import { LaneUtils } from 'app/utils/lane.utils';

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

	private widths: TvLaneWidth[] = [];

	public borders: TvLaneBorder[] = [];

	public roadMarks = new OrderedMap<TvLaneRoadMark>();

	public materials: TvLaneMaterial[] = [];

	public visibility: TvLaneVisibility[] = [];

	public speed: TvLaneSpeed[] = [];

	public access: TvLaneAccess[] = [];

	public height: TvLaneHeight[] = [];

	public threeMaterialGuid: string;

	public side: TvLaneSide;

	public isSelected: boolean;

	public direction: TravelDirection;

	public successorId: number;
	public predecessorId: number;

	private successorUUID: string;
	private predecessorUUID: string;

	private _laneSection: TvLaneSection;

	constructor ( side: TvLaneSide, id: number, type: TvLaneType, level: boolean = false, laneSection?: TvLaneSection ) {

		this.side = side;

		this.uuid = MathUtils.generateUUID();
		this.id = id;
		this.type = type;
		this.level = level;
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

	getRoad (): TvRoad {
		return this.laneSection.getRoad();
	}

	getLaneSection (): TvLaneSection {
		return this.laneSection;
	}

	toString () {
		return `Lane:${ this.id } Side:${ this.side } Type:${ this.type }`;
	}

	isCarriageWay (): boolean {
		return this.type != TvLaneType.sidewalk && this.type != TvLaneType.curb;
	}

	get isDrivingLane (): boolean {
		return this.type == TvLaneType.driving;
	}

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

	get isCenter (): boolean {
		return this.side === TvLaneSide.CENTER;
	}

	get laneSectionId (): number {
		return this._laneSection?.id;
	}

	get successorExists (): boolean {
		return !!this.successorId && !!this.successorUUID;
	}

	get predecessorExists (): boolean {
		return !!this.predecessorId && !!this.predecessorUUID;
	}

	isSuccessor ( lane: TvLane ): boolean {
		return this.successorUUID === lane.uuid;
	}

	isPredecessor ( lane: TvLane ): boolean {
		return this.predecessorUUID === lane.uuid;
	}

	unsetPredecessor (): void {
		this.predecessorId = undefined;
		this.predecessorUUID = undefined;
	}

	unsetSuccessor (): void {
		this.successorId = undefined;
		this.successorUUID = undefined;
	}

	setPredecessor ( lane: TvLane ): void {
		if ( this.isCenter || lane.type != this.type ) return;
		this.predecessorId = lane.id;
		this.predecessorUUID = lane.uuid;
	}

	setSuccessor ( lane: TvLane ): void {
		if ( this.isCenter || lane.type != this.type ) return;
		this.successorId = lane.id;
		this.successorUUID = lane.uuid;
	}

	setOrUnsetSuccessor ( lane?: TvLane ): void {
		if ( lane ) {
			this.setSuccessor( lane );
		} else {
			this.unsetSuccessor();
		}
	}

	setOrUnsetPredecessor ( lane?: TvLane ): void {
		if ( lane ) {
			this.setPredecessor( lane );
		} else {
			this.unsetPredecessor();
		}
	}

	setLinks ( predecessor: TvLane, successor: TvLane ): void {
		this.setPredecessor( predecessor );
		this.setSuccessor( successor );
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

	addWidthRecord ( s: number, a: number, b: number, c: number, d: number ): void {

		return this.addWidthRecordInstance( new TvLaneWidth( s, a, b, c, d ) );

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

			this.materials.push( new TvLaneMaterial( sOffset, surface, friction, roughness ) );

		} else {

			this.materials[ index ] = ( new TvLaneMaterial( sOffset, surface, friction, roughness ) );

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

	addHeightRecord ( sOffset: number, inner: number, outer: number ): void {

		this.addHeightRecordInstance( new TvLaneHeight( sOffset, inner, outer ) );

	}

	addHeightRecordInstance ( height: TvLaneHeight ): void {

		const index = this.checkLaneHeightInterval( height.sOffset ) + 1;

		if ( index > this.getLaneHeightCount() ) {

			this.height.push( height );

		} else {

			this.height[ index ] = height;

		}

		this.height.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	clearLaneHeight (): void {
		this.height.splice( 0, this.height.length );
	}

	clearRoadMarks (): void {
		this.roadMarks.clear();
	}

	clearLaneWidth (): void {
		this.widths.splice( 0, this.widths.length );
	}

	getWidthArray (): TvLaneWidth[] {
		return this.widths;
	}

	getLaneMaterial ( index ): TvLaneMaterial {

		if ( this.materials.length > 0 && index < this.materials.length ) {
			return this.materials[ index ];
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
		return this.widths.length;
	}

	getLaneMaterialCount (): number {
		return this.materials.length;
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

		for ( let i = 0; i < this.materials.length; i++ ) {

			if ( sCheck >= this.materials[ i ].sOffset ) {

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

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this._laneSection );

		this.getWidthArray().forEach( width => {
			newLane.addWidthRecordInstance( new TvLaneWidth( width.s, width.a, width.b, width.c, width.d ) );
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

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this._laneSection );

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

		return TvUtils.checkIntervalArray( this.widths, s );

	}

	getRoadMarkAt ( s: number ): TvLaneRoadMark {

		return this.roadMarks.findAt( s );

	}

	addRoadMarkInstance ( roadmark: TvLaneRoadMark ) {

		this.roadMarks.set( roadmark.s, roadmark );

	}

	addWidthRecordInstance ( laneWidth: TvLaneWidth ): void {

		this.widths.push( laneWidth );
		this.sortWidth();

	}

	removeWidthRecordInstance ( laneWidth: TvLaneWidth ): void {

		this.widths.splice( this.widths.indexOf( laneWidth ), 1 );
		this.sortWidth();

	}

	copyProperties?(): Object {

		return {
			travelDirection: this.direction,
			type: this.type,
			level: this.level,
		};
	}

	removeRoadMark ( roadmark: TvLaneRoadMark ): void {

		this.roadMarks.remove( roadmark );

	}

	removeRoadMarks (): void {

		this.roadMarks.clear();

	}

	addBorder ( border: TvLaneBorder ) {

		this.borders.push( border );

	}

	isEqualTo ( lane: TvLane ): boolean {
		return this.uuid === lane.uuid;
	}

	isMatching ( otherLane: TvLane ): boolean {

		if ( this.type != otherLane.type ) return false;
		if ( this.direction != otherLane.direction ) return false;

		return true;
	}

	matchesDirection ( direction: TravelDirection ): boolean {
		return this.direction === direction;
	}

	toLaneCoord ( distance: number | TvContactPoint ): TvLaneCoord {
		return new TvLaneCoord( this.getRoad(), this.getLaneSection(), this, createLaneDistance( this, distance ), 0 );
	}

	isExit ( contact: TvContactPoint ): boolean {
		return ( this.direction === TravelDirection.forward && contact === TvContactPoint.START ) ||
			( this.direction === TravelDirection.backward && contact === TvContactPoint.END );
	}

	isEntry ( contact: TvContactPoint ): boolean {
		return ( this.direction === TravelDirection.forward && contact === TvContactPoint.END ) ||
			( this.direction === TravelDirection.backward && contact === TvContactPoint.START );
	}

	static stringToType ( type: string ): TvLaneType {
		return LaneUtils.stringToType( type );
	}

	static typeToString ( type: TvLaneType ): string {
		return LaneUtils.typeToString( type );
	}

	addDefaultWidth (): void {
		this.addWidthRecord( 0, 3.5, 0, 0, 0 );
	}

	updateWidthCoefficients (): void {
		TvUtils.computeCoefficients( this.widths, this.laneSection.getLength() );
	}

	removeInvalidWidths (): void {

		for ( let i = 0; i < this.widths.length; i++ ) {

			const width = this.widths[ i ];

			// Remove nodes that are out of bounds
			if ( width.s < 0 || width.s > this.laneSection.getLength() ) {
				this.widths.splice( i, 1 );
			}
		}
	}

	sortWidth (): void {
		this.widths.sort( ( a, b ) => a.s > b.s ? 1 : -1 );
	}
}

