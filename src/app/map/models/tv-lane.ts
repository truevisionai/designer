/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/objects/game-object';
import { IHasUpdate } from 'app/commands/set-value-command';
import { ISelectable } from 'app/objects/i-selectable';
import { MathUtils } from "three";
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
import { TvLaneWidth, TvLaneWidthProfile } from './tv-lane-width';
import { LaneHeightProfile, TvLaneHeight } from '../lane-height/lane-height.model';
import { OrderedMap } from "../../core/models/ordered-map";
import { TvRoad } from './tv-road.model';
import { TvLaneCoord } from './tv-lane-coord';
import { LaneUtils } from 'app/utils/lane.utils';
import { TrafficRule } from './traffic-rule';
import { createLaneDistance } from '../road/road-distance';

export class TvLane implements ISelectable, IHasUpdate {

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

	private widthProfile: TvLaneWidthProfile;

	private borders: TvLaneBorder[] = [];

	private _roadMarks = new OrderedMap<TvLaneRoadMark>();

	public materials: TvLaneMaterial[] = [];

	public visibility: TvLaneVisibility[] = [];

	public speed: TvLaneSpeed[] = [];

	public access: TvLaneAccess[] = [];

	private heightProfile: LaneHeightProfile;

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
		this.widthProfile = new TvLaneWidthProfile( this );
		this.heightProfile = new LaneHeightProfile( this );

		this.direction = this.detectDirection();

	}

	getRoad (): TvRoad {
		return this.laneSection.getRoad();
	}

	getLaneSection (): TvLaneSection {
		return this.laneSection;
	}

	toString (): string {
		return `Lane:${ this.id } Side:${ this.side } Type:${ this.type }`;
	}

	isCarriageWay (): boolean {
		return this.type != TvLaneType.sidewalk && this.type != TvLaneType.curb;
	}

	/**
	 * Returns true if the lane is for traffic participants, flow of traffic
	 */
	get isTrafficLane (): boolean {
		return (
			this.type === TvLaneType.driving ||
			this.type === TvLaneType.biking ||
			this.type === TvLaneType.slipLane ||
			this.type === TvLaneType.shared ||
			this.type === TvLaneType.bidirectional ||
			this.type === TvLaneType.entry ||
			this.type === TvLaneType.exit ||
			this.type === TvLaneType.onRamp ||
			this.type === TvLaneType.offRamp ||
			this.type === TvLaneType.connectingRamp ||
			this.type === TvLaneType.bus ||
			this.type === TvLaneType.taxi ||
			this.type === TvLaneType.HOV
		)
	}

	get roadMarks (): OrderedMap<TvLaneRoadMark> {
		return this._roadMarks;
	}

	set roadMarks ( value ) {
		this._roadMarks = value;
	}

	get height (): TvLaneHeight[] {
		return this.heightProfile.getArray();
	}

	get isForward (): boolean {
		return this.direction === TravelDirection.forward;
	}

	get isReversed (): boolean {

		if ( this.isCenter ) return false;

		if ( this.laneSection.road.hasRightHandTraffic ) {

			if ( this.isRight && this.isBackward ) return true;
			if ( this.isLeft && this.isForward ) return true;

		} else {

			if ( this.isRight && this.isForward ) return true;
			if ( this.isLeft && this.isBackward ) return true;

		}

		return false;
	}

	get isBackward (): boolean {
		return this.direction === TravelDirection.backward;
	}

	get isDrivingLane (): boolean {
		return this.type == TvLaneType.driving;
	}

	get isSidewalk (): boolean {
		return this.type == TvLaneType.sidewalk;
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

	addRoadMarkRecord ( sOffset: number, type: TvRoadMarkTypes, weight: TvRoadMarkWeights, color: TvColors, width: number, laneChange: TvRoadMarkLaneChange, height: number ): TvLaneRoadMark {

		const roadMark = new TvLaneRoadMark( sOffset, type, weight, color, width, laneChange, height, this );

		this.addRoadMarkInstance( roadMark );

		return roadMark;
	}

	addNoneRoadMark ( s: number = 0 ): TvLaneRoadMark {

		return this.addRoadMarkRecord( s, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.WHITE, 0.0, TvRoadMarkLaneChange.NONE, 0.0 );

	}

	addRoadMarkOfType ( s: number = 0, type: TvRoadMarkTypes ): TvLaneRoadMark {

		return this.addRoadMarkRecord( s, type, TvRoadMarkWeights.STANDARD, TvColors.WHITE, 0.15, TvRoadMarkLaneChange.NONE, 0.0 );

	}

	addSolidRoadMark ( s: number = 0 ): this {

		this.addRoadMarkOfType( s, TvRoadMarkTypes.SOLID );

		return this;

	}

	addMaterialRecord ( sOffset: number, surface: string, friction: number, roughness: number ): void {

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

	addVisibilityRecord ( sOffset: number, forward: number, back: number, left: number, right: number ): number {

		const index = this.checkLaneVisibilityInterval( sOffset ) + 1;

		if ( index > this.getLaneVisibilityCount() ) {

			this.visibility.push( new TvLaneVisibility( sOffset, forward, back, left, right ) );

		} else {

			this.visibility[ index ] = new TvLaneVisibility( sOffset, forward, back, left, right );

		}

		return index;

	}

	addSpeedRecord ( sOffset: number, max: number, unit: string ): number {

		const index = this.checkLaneSpeedInterval( sOffset ) + 1;

		if ( index > this.getLaneSpeedCount() ) {

			this.speed.push( new TvLaneSpeed( sOffset, max, unit ) );

		} else {

			this.speed[ index ] = new TvLaneSpeed( sOffset, max, unit );

		}

		return index;
	}

	addAccessRecord ( sOffset: number, restriction: string ): number {

		const index = this.checkLaneAccessInterval( sOffset ) + 1;

		if ( index > this.getLaneAccessCount() ) {

			this.access.push( new TvLaneAccess( sOffset, restriction ) );

		} else {

			this.access[ index ] = new TvLaneAccess( sOffset, restriction );

		}

		return index;
	}

	addHeightRecord ( sOffset: number, inner: number, outer: number ): void {
		this.heightProfile.createAndAddHeight( sOffset, inner, outer );
	}

	addHeightRecordInstance ( height: TvLaneHeight ): void {
		this.heightProfile.addHeight( height );
	}

	clearLaneHeight (): void {
		this.heightProfile.clear();
	}

	clearRoadMarks (): void {
		this.roadMarks.clear();
	}

	clearLaneWidth (): void {
		this.widthProfile.clear();
	}

	getWidthArray (): TvLaneWidth[] {
		return this.widthProfile.getWidthArray();
	}

	getLaneMaterial ( index: any ): TvLaneMaterial {

		if ( this.materials.length > 0 && index < this.materials.length ) {
			return this.materials[ index ];
		}

		return null;
	}

	getLaneVisibility ( index: any ): TvLaneVisibility {

		if ( this.visibility.length > 0 && index < this.visibility.length ) {
			return this.visibility[ index ];
		}

		return null;
	}

	getLaneSpeed ( index: any ): TvLaneSpeed {

		if ( this.speed.length > 0 && index < this.speed.length ) {
			return this.speed[ index ];
		}

		return null;
	}

	getLaneAccess ( index: any ): TvLaneAccess {

		if ( this.access.length > 0 && index < this.access.length ) {
			return this.access[ index ];
		}

		return null;
	}

	getLaneHeight ( index: number ): TvLaneHeight {
		return this.heightProfile.getHeightByIndex( index );
	}

	getLaneWidthCount (): number {
		return this.widthProfile.getWidthCount();
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
		return this.heightProfile.getHeightCount();
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

	/**
	 * Evaluate the record and the return the width value
	 * @param sCheck
	 */
	getWidthValue ( sCheck: number ): number {

		const widthEntry = this.getLaneWidthAt( sCheck );

		if ( widthEntry == null ) return 0;

		return widthEntry.getValue( sCheck );
	}

	getWidthValueAt ( value: number | TvContactPoint ): number {

		return this.getWidthValue( createLaneDistance( this, value ) );

	}

	/**
	 * Evaluate the record and return the height object
	 * @param sOffset
	 */
	getHeightValue ( sOffset: number ): TvLaneHeight {
		return this.heightProfile.getHeightValue( sOffset );
	}

	/**
	 * Evaluate the road marks records and return the road
	 * mark object corresponding to the provided s-offset
	 * @param sCheck
	 */
	getRoadMark ( sCheck: number ): TvLaneRoadMark {

		return this.getRoadMarkAt( sCheck );

	}

	// clones the entire lane
	clone ( id?: number ): TvLane {

		const laneId = id || this.id;

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this._laneSection );

		this.getWidthArray().forEach( width => {
			newLane.addWidthRecordInstance( new TvLaneWidth( width.s, width.a, width.b, width.c, width.d ) );
		} );

		this.height.forEach( height => {
			newLane.addHeightRecordInstance( new TvLaneHeight( height.sOffset, height.inner, height.outer ) );
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

		return this.widthProfile.getWidthAt( s );

	}

	getRoadMarkAt ( s: number ): TvLaneRoadMark {

		const roadmark = this.roadMarks.findAt( s );

		if ( roadmark ) {
			return roadmark;
		}

		return new TvLaneRoadMark(
			s,
			TvRoadMarkTypes.NONE,
			TvRoadMarkWeights.STANDARD,
			TvColors.WHITE,
			0.0,
			TvRoadMarkLaneChange.NONE,
			0.0,
			this
		);
	}

	addRoadMarkInstance ( roadmark: TvLaneRoadMark ): void {

		roadmark.lane = this;

		this.roadMarks.set( roadmark.s, roadmark );

	}

	addWidthRecordInstance ( laneWidth: TvLaneWidth ): void {
		this.widthProfile.addWidthRecord( laneWidth );
	}

	removeWidthRecordInstance ( laneWidth: TvLaneWidth ): void {
		this.widthProfile.removeWidthRecord( laneWidth );
	}

	removeRoadMark ( roadmark: TvLaneRoadMark ): void {

		this.roadMarks.remove( roadmark );

	}

	removeRoadMarks (): void {

		this.roadMarks.clear();

	}

	addBorder ( border: TvLaneBorder ): void {

		this.borders.push( border );

	}

	equals ( lane: TvLane ): boolean {
		return this.uuid === lane.uuid;
	}

	isMatching ( otherLane: TvLane ): boolean {

		if ( this.type != otherLane.type ) return false;
		if ( this.direction != otherLane.direction ) return false;

		return true;
	}

	matchesDirection ( direction: TravelDirection ): boolean {

		if ( this.isCenter ) return false
		if ( this.isTrafficLane ) return this.direction === direction;

		return true;
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

	addDefaultWidth (): this {
		this.addWidthRecord( 0, 3.5, 0, 0, 0 );
		return this;
	}

	updateWidthCoefficients (): void {
		this.widthProfile.updateCoefficients();
	}

	removeInvalidWidths (): void {
		this.widthProfile.removeInvalidWidths();
	}

	sortWidth (): void {
		this.widthProfile.sortWidth();
	}

	addWidthRecordAtEnd ( width: number ): void {
		this.addWidthRecord( this.laneSection.getLength(), width, 0, 0, 0 );
	}

	addWidthRecordAtStart ( width: number ): void {
		this.addWidthRecord( 0, width, 0, 0, 0 );
	}

	getType (): TvLaneType {
		return this.type;
	}

	switchSide (): void {
		this.side = this.side === TvLaneSide.LEFT ? TvLaneSide.RIGHT : TvLaneSide.LEFT;
	}

	switchDirection (): void {
		if ( this.direction === TravelDirection.backward ) {
			this.direction = TravelDirection.forward;
		} else if ( this.direction === TravelDirection.forward ) {
			this.direction = TravelDirection.backward;
		}
	}

	switchSideAndDirection (): this {
		this.switchSide();
		this.switchDirection();
		return this;
	}

	getSuccessorLane (): TvLane | undefined {

		if ( !this.successorExists ) return;

		const successor = this.laneSection.road.getSuccessor();

		if ( !successor.isRoad ) return;

		const section = successor.getElement<TvRoad>().getLaneSectionAt( successor.contact );

		return section.getLaneById( this.successorId );

	}

	getPredecessorLane (): TvLane | undefined {

		if ( !this.predecessorExists ) return;

		const predecessor = this.laneSection.road.getPredecessor();

		if ( !predecessor.isRoad ) return;

		const section = predecessor.getElement<TvRoad>().getLaneSectionAt( predecessor.contact );

		return section.getLaneById( this.predecessorId );

	}

	isEqualOrAfter ( target: TvLane ): boolean {
		return Math.abs( this.id ) >= Math.abs( target.id );
	}

	isEqualOrBefore ( target: TvLane ): boolean {
		return Math.abs( this.id ) <= Math.abs( target.id );
	}

	private detectDirection (): TravelDirection | undefined {

		if ( this.isCenter ) return undefined;

		const trafficRule = this.laneSection?.road?.trafficRule || TrafficRule.RHT;

		if ( this.isTrafficLane && trafficRule === TrafficRule.RHT ) {

			return this.isLeft ? TravelDirection.backward : TravelDirection.forward;

		} else if ( this.isTrafficLane && trafficRule === TrafficRule.LHT ) {

			return this.isRight ? TravelDirection.backward : TravelDirection.forward;

		} else {

			return TravelDirection.undirected;

		}
	}
}

