/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { MathUtils } from 'three';
import { MeshGeometryData } from './mesh-geometry.data';
import { TravelDirection, TvColors, TvLaneSide, TvLaneType, TvRoadMarkTypes, TvRoadMarkWeights } from './tv-common';
import { TvLaneAccess } from './tv-lane-access';
import { TvLaneBorder } from './tv-lane-border';
import { TvLaneHeight } from './tv-lane-height';
import { TvLaneMaterial } from './tv-lane-material';
import { TvLaneRoadMark } from './tv-lane-road-mark';
import { TvLaneSection } from './tv-lane-section';
import { TvLaneSpeed } from './tv-lane-speed';
import { TvLaneVisibility } from './tv-lane-visibility';
import { TvLaneWidth } from './tv-lane-width';
import { TvRoadLaneSectionLaneLink } from './tv-road-lane-section-lane-link';
import { TvUtils } from './tv-utils';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { Copiable } from 'app/core/services/property-copy.service';

export class TvLane implements ISelectable, Copiable {

	public readonly uuid: string;

	public gameObject: GameObject;
	public meshData: MeshGeometryData;
	public markMeshData: MeshGeometryData;
	public attr_id: number;
	public attr_type: TvLaneType;

	/**
	 * "true" = keep lane on level, .i.e. do not apply superelevation or crossfall
	 * "false" = apply superelevation and crossfall to this lane (default,
	 * also used if argument level is missing) lanes are also kept on level if
	 * the argument level is present but no superelevation or crossfall
	 * have been defined.
	 * default is false
	 */
	public attr_level: boolean = false;

	public link: TvRoadLaneSectionLaneLink;
	public width: TvLaneWidth[] = [];
	public border: TvLaneBorder[] = [];
	public roadMark: TvLaneRoadMark[] = [];
	public material: TvLaneMaterial[] = [];
	public visibility: TvLaneVisibility[] = [];
	public speed: TvLaneSpeed[] = [];
	public access: TvLaneAccess[] = [];
	private height: TvLaneHeight[] = [];
	private _successor: number;
	private lastAddedLaneWidth: number;
	private lastAddedLaneRoadMark: number;
	private lastAddedLaneMaterial: number;
	private lastAddedLaneVisibility: number;
	private lastAddedLaneSpeed: number;
	private lastAddedLaneAccess: number;
	private lastAddedLaneHeight: number;
	private _laneSection: TvLaneSection;

	public travelDirection: TravelDirection;

	constructor ( laneSide: TvLaneSide, id: number, type: TvLaneType, level: boolean = false, roadId?: number, laneSection?: TvLaneSection ) {

		this._side = laneSide;

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

	isSelected: boolean;
	select (): void {
		this.isSelected = true;
	}
	unselect (): void {
		this.isSelected = false;
	}

	private _roadId: number;

	get roadId () {
		return this._roadId;
	}

	set roadId ( value ) {
		this._roadId = value;
	}

	get laneSection (): TvLaneSection {
		return this._laneSection;
	}

	set laneSection ( value: TvLaneSection ) {
		this._laneSection = value;
	}

	private _side: TvLaneSide;

	get side (): TvLaneSide {
		return this._side;
	}

	set side ( value ) {

		const som = '' + value;
		const val = parseFloat( som );

		if ( val === 0 ) {
			this._side = TvLaneSide.LEFT;
		} else if ( val === 1 ) {
			this._side = TvLaneSide.CENTER;
		} else if ( val === 2 ) {
			this._side = TvLaneSide.RIGHT;
		}
	}

	private _predecessorExists: boolean;

	get predecessorExists (): boolean {
		return this._predecessorExists;
	}

	set predecessorExists ( value: boolean ) {
		this._predecessorExists = value;
	}

	private _successorExists: boolean;

	// updateMeshGeometry (): any {

	//   let posTheta = new OdPosTheta;
	//   let road = OdEditorComponent.openDrive.getRoadById( this.roadId );
	//   let laneSection = road.getLaneSection( 0 );
	//   let cumulativeWidth = 0;

	//   this.meshData = null;
	//   this.meshData = new MeshGeometryData;

	//   for ( let sCoordinate = laneSection.s; sCoordinate < laneSection.lastSCoordinate; sCoordinate += OdBuilderConfig.ROAD_STEP ) {

	//     cumulativeWidth = laneSection.getCumulativeWidth( this, sCoordinate );

	//     road.getGeometryCoords( sCoordinate, posTheta );

	//     this.makeLaneVertices( sCoordinate, posTheta, lane, road, cumulativeWidth );

	//   }

	//   cumulativeWidth = laneSection.getCumulativeWidth( lane, laneSection.lastSCoordinate );

	//   this.makeLaneVertices( laneSection.lastSCoordinate - Maths.Epsilon, posTheta, lane, road, 0 );

	//   var geometry = new BufferGeometry();

	//   const vertices = new Float32Array( this.meshData.vertices );
	//   const colors = new Float32Array( this.meshData.colors );

	//   this.createMeshIndices( this.meshData );

	//   geometry.setIndex( this.meshData.triangles );

	//   geometry.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );
	//   geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) );

	//   var material = new MeshBasicMaterial( { color: OdColorFactory.getLaneColor( lane ), transparent: true, opacity: 1 } );

	//   this.gameObject = new GameObject( "Lane:" + this.id, geometry, material );
	//   this.gameObject.Tag = OpenDriveObjectType[OpenDriveObjectType.LANE];
	//   this.gameObject.OpenDriveType = OpenDriveObjectType.LANE;
	//   this.gameObject.userData.data = lane;

	//   laneSection.gameObject.add( this.gameObject );

	// }

	// private mwidth; mheight; elevation; cosHdgPlusPiO2; sinHdgPlusPiO2;

	// private makeLaneVertices ( sCoordinate: number, pos: OdPosTheta, lane: OdLane, road: OdRoad, cumulativeWidth: number ) {

	//   this.mwidth = lane.getWidthValue( sCoordinate );
	//   this.mheight = lane.getHeightValue( sCoordinate );
	//   this.elevation = road.getElevationValue( sCoordinate );

	//   this.cosHdgPlusPiO2 = Maths.cosHdgPlusPiO2( lane.side, pos.hdg );
	//   this.sinHdgPlusPiO2 = Maths.sinHdgPlusPiO2( lane.side, pos.hdg );

	//   var v1 = new Vertex();
	//   var p1X = this.cosHdgPlusPiO2 * cumulativeWidth;
	//   var p1Y = this.sinHdgPlusPiO2 * cumulativeWidth;
	//   v1.Position = new Vector3( pos.x + p1X, pos.y + p1Y, this.elevation );
	//   v1.TexCoord = new Vector2( 0, sCoordinate );

	//   var v2 = new Vertex();
	//   var p2X = cosHdgPlusPiO2 * ( cumulativeWidth + width );
	//   var p2Y = sinHdgPlusPiO2 * ( cumulativeWidth + width );
	//   v2.Position = new Vector3( pos.x + p2X, pos.y + p2Y, elevation + height.getOuter() );
	//   v2.TexCoord = new Vector2( width + height.getOuter(), sCoordinate )

	//   if ( lane.side == LaneSide.RIGHT ) {
	//     this.addVertex( lane.meshData, v1 );
	//     this.addVertex( lane.meshData, v2 );
	//   } else {
	//     this.addVertex( lane.meshData, v2 );
	//     this.addVertex( lane.meshData, v1 );
	//   }

	//   // Debug.log( v1.Position, v2.Position );
	// }

	// addVertex ( meshData: MeshGeometryData, v1: Vertex ) {

	//   meshData.vertices.push( v1.Position.x, v1.Position.y, v1.Position.z );
	//   meshData.normals.push( v1.Normal.x, v1.Normal.y, v1.Normal.z );
	//   meshData.texCoords.push( v1.TexCoord.x, v1.TexCoord.y );
	//   meshData.colors.push( 0, 1, 0 );
	//   meshData.indices.push( meshData.currentIndex++ );

	// }

	get successorExists (): boolean {
		return this._successorExists;
	}

	set successorExists ( value: boolean ) {
		this._successorExists = value;
	}

	private _predecessor: number;

	get predecessor () {
		return this._predecessor;
	}

	set predecessor ( laneId: number ) {
		this.setPredecessor( laneId );
	}

	set successor ( laneId: number ) {
		this.setSuccessor( laneId );
	}

	get laneSectionId () {
		return this._laneSection?.id;
	}

	get direction () { return this.travelDirection; }

	set direction ( value: TravelDirection ) { this.travelDirection = value }

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

	//
	// Methods used to add child records to the respective lane records
	//

	get succcessor () {
		return this._successor;
	}

	set succcessor ( laneId: number ) {
		this.setPredecessor( laneId );
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

	//
	// CLONE METHODS
	//

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

		return this.addWidthRecordInstance( new TvLaneWidth( s, a, b, c, d, this, this.laneSection.road ) );

	}

	addRoadMarkRecord ( sOffset: number, type: TvRoadMarkTypes, weight: TvRoadMarkWeights, color: TvColors, width: number, laneChange: string, height: number ) {

		return this.addRoadMarkInstance( new TvLaneRoadMark( sOffset, type, weight, color, width, laneChange, height, this ) );

	}

	addMaterialRecord ( sOffset: number, surface: string, friction: number, roughness: number ) {

		const index = this.checkLaneMaterialInterval( sOffset ) + 1;

		if ( index > this.getLaneMaterialCount() ) {

			this.material.push( new TvLaneMaterial( sOffset, surface, friction, roughness ) );

		} else {

			this.material[ index ] = ( new TvLaneMaterial( sOffset, surface, friction, roughness ) );

		}

		this.lastAddedLaneMaterial = index;

		return index;
	}

	addVisibilityRecord ( sOffset: number, forward: number, back: number, left: number, right: number ) {

		const index = this.checkLaneVisibilityInterval( sOffset ) + 1;

		if ( index > this.getLaneVisibilityCount() ) {

			this.visibility.push( new TvLaneVisibility( sOffset, forward, back, left, right ) );

		} else {

			this.visibility[ index ] = new TvLaneVisibility( sOffset, forward, back, left, right );

		}

		this.lastAddedLaneVisibility = index;

		return index;

	}

	//
	// DELETE METHODS
	//

	addSpeedRecord ( sOffset: number, max: number, unit: string ) {

		const index = this.checkLaneSpeedInterval( sOffset ) + 1;

		if ( index > this.getLaneSpeedCount() ) {

			this.speed.push( new TvLaneSpeed( sOffset, max, unit ) );

		} else {

			this.speed[ index ] = new TvLaneSpeed( sOffset, max, unit );

		}

		this.lastAddedLaneSpeed = index;

		return index;
	}

	addAccessRecord ( sOffset: number, restriction: string ) {

		const index = this.checkLaneAccessInterval( sOffset ) + 1;

		if ( index > this.getLaneAccessCount() ) {

			this.access.push( new TvLaneAccess( sOffset, restriction ) );

		} else {

			this.access[ index ] = new TvLaneAccess( sOffset, restriction );

		}

		this.lastAddedLaneAccess = index;

		return index;
	}

	addHeightRecord ( sOffset: number, inner: number, outer: number ) {

		const index = this.checkLaneHeightInterval( sOffset ) + 1;

		if ( index > this.getLaneHeightCount() ) {

			this.height.push( new TvLaneHeight( sOffset, inner, outer ) );

		} else {

			this.height[ index ] = new TvLaneHeight( sOffset, inner, outer );

		}

		this.lastAddedLaneHeight = index;

		return index;
	}

	cloneLaneWidth ( index: number ) {

		if ( index < this.width.length - 1 ) {

			this.width[ index + 1 ] = this.width[ index ];

		} else if ( index === this.width.length - 1 ) {

			this.width.push( this.width[ index ] );

		}

		this.lastAddedLaneWidth = index + 1;

		return this.lastAddedLaneWidth;
	}

	cloneLaneRoadMark ( index: number ) {

		if ( index < this.roadMark.length - 1 ) {

			this.roadMark[ index + 1 ] = ( this.roadMark[ index ] );

		} else if ( index === this.roadMark.length - 1 ) {

			this.roadMark.push( this.roadMark[ index ] );

		}

		this.lastAddedLaneRoadMark = index + 1;

		return this.lastAddedLaneRoadMark;
	}

	cloneLaneMaterial ( index: number ) {

		if ( index < this.material.length - 1 ) {

			this.material[ index + 1 ] = ( this.material[ index ] );

		} else if ( index === this.material.length - 1 ) {

			this.material.push( this.material[ index ] );

		}

		this.lastAddedLaneMaterial = index + 1;

		return this.lastAddedLaneMaterial;
	}

	cloneLaneVisibility ( index: number ) {

		if ( index < this.visibility.length - 1 ) {

			this.visibility[ index + 1 ] = ( this.visibility[ index ] );

		} else if ( index === this.visibility.length - 1 ) {

			this.visibility.push( this.visibility[ index ] );

		}

		this.lastAddedLaneVisibility = index + 1;

		return this.lastAddedLaneVisibility;
	}

	cloneLaneSpeed ( index: number ) {

		if ( index < this.speed.length - 1 ) {

			this.speed[ index + 1 ] = ( this.speed[ index ] );

		} else if ( index === this.speed.length - 1 ) {

			this.speed.push( this.speed[ index ] );

		}

		this.lastAddedLaneSpeed = index + 1;

		return this.lastAddedLaneSpeed;
	}

	cloneLaneAccess ( index: number ) {

		if ( index < this.access.length - 1 ) {

			this.access[ index + 1 ] = ( this.access[ index ] );

		} else if ( index === this.access.length - 1 ) {

			this.access.push( this.access[ index ] );

		}

		this.lastAddedLaneAccess = index + 1;

		return this.lastAddedLaneAccess;
	}

	cloneLaneHeight ( index: number ) {

		if ( index < this.height.length - 1 ) {

			this.height[ index + 1 ] = ( this.height[ index ] );

		} else if ( index === this.height.length - 1 ) {

			this.height.push( this.height[ index ] );

		}

		this.lastAddedLaneHeight = index + 1;

		return this.lastAddedLaneHeight;
	}

	deleteLaneWidth ( index: number ) {
		this.width.splice( index, 1 );
	}

	clearLaneWidth () {
		this.width.splice( 0, this.width.length );
	}

	deleteLaneRoadMark ( index: number ) {
		this.roadMark.splice( index, 1 );
	}

	deleteLaneMaterial ( index: number ) {
		this.material.splice( index, 1 );
	}

	deleteLaneVisibility ( index: number ) {
		this.visibility.splice( index, 1 );
	}

	deleteLaneSpeed ( index: number ) {
		this.speed.splice( index, 1 );
	}

	deleteLaneAccess ( index: number ) {
		this.access.splice( index, 1 );
	}

	deleteLaneHeight ( index: number ) {
		this.height.splice( index, 1 );
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

	//
	// GET POINTER TO RECORDS

	//
	getLaneWidthVector (): TvLaneWidth[] {
		return this.width;
	}

	getLaneRoadMarkVector (): TvLaneRoadMark[] {
		return this.roadMark;
	}

	getLaneMaterialVector (): TvLaneMaterial[] {
		return this.material;
	}

	getLaneVisibilityVector (): TvLaneVisibility[] {
		return this.visibility;
	}

	getLaneSpeedVector (): TvLaneSpeed[] {
		return this.speed;
	}

	getLaneAccessVector (): TvLaneAccess[] {
		return this.access;
	}

	getLaneHeightVector (): TvLaneHeight[] {
		return this.height;
	}


	//
	// GET ELEMENT AT INDEX
	//

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

	//
	// GET COUNT OF ELEMENTS
	//

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

	//
	// GET LAST ELEMENT
	//

	getLastLaneWidth () {

		if ( this.width.length > 0 ) {
			return this.width[ this.width.length - 1 ];
		}

		return null;
	}

	getLastLaneRoadMark () {

		if ( this.roadMark.length > 0 ) {
			return this.roadMark[ this.roadMark.length - 1 ];
		}

		return null;
	}

	getLastLaneMaterial () {

		if ( this.material.length > 0 ) {
			return this.material[ this.material.length - 1 ];
		}

		return null;
	}

	getLastLaneVisibility () {

		if ( this.visibility.length > 0 ) {
			return this.visibility[ this.visibility.length - 1 ];
		}

		return null;
	}

	getLastLaneSpeed () {

		if ( this.speed.length > 0 ) {
			return this.speed[ this.speed.length - 1 ];
		}

		return null;
	}

	getLastLaneAccess () {

		if ( this.access.length > 0 ) {
			return this.access[ this.access.length - 1 ];
		}

		return null;
	}

	getLastLaneHeight () {

		if ( this.height.length > 0 ) {
			return this.height[ this.height.length - 1 ];
		}

		return null;
	}

	/**
	 *  Get the last added elements of a certain vectors
	 * (their position might not be at the end of the vector)
	 */

	getLastAddedLaneWidth () {
		if ( this.lastAddedLaneWidth < this.width.length ) {
			return this.width[ this.lastAddedLaneWidth ];
		}
		return null;
	}

	getLastAddedLaneRoadMark () {
		if ( this.lastAddedLaneRoadMark < this.roadMark.length ) {
			return this.roadMark[ this.lastAddedLaneRoadMark ];
		}
		return null;
	}

	getLastAddedLaneMaterial () {
		if ( this.lastAddedLaneMaterial < this.material.length ) {
			return this.material[ this.lastAddedLaneMaterial ];
		}
		return null;
	}

	getLastAddedLaneVisibility () {
		if ( this.lastAddedLaneVisibility < this.visibility.length ) {
			return this.visibility[ this.lastAddedLaneVisibility ];
		}
		return null;
	}

	getLastAddedLaneSpeed () {
		if ( this.lastAddedLaneSpeed < this.speed.length ) {
			return this.speed[ this.lastAddedLaneSpeed ];
		}
		return null;
	}

	getLastAddedLaneAccess () {
		if ( this.lastAddedLaneAccess < this.access.length ) {
			return this.access[ this.lastAddedLaneAccess ];
		}
		return null;
	}

	getLastAddedLaneHeight () {
		if ( this.lastAddedLaneHeight < this.height.length ) {
			return this.height[ this.lastAddedLaneHeight ];
		}
		return null;
	}

	/**
	 *  Check the intervals and return the index of the records that applies to the provided s-offset
	 */

	getLaneWidthIndex ( sCheck: number ): number {

		let result = null;

		for ( let i = 0; i < this.width.length; i++ ) {

			if ( sCheck >= this.width[ i ].s ) result = i;

		}

		return result;
	}

	checkLaneRoadMarkInterval ( sCheck: number ): number {

		let res = -1;

		for ( let i = 0; i < this.roadMark.length; i++ ) {

			if ( sCheck >= this.roadMark[ i ].sOffset ) {

				res = i;

			} else {

				break;

			}

		}

		return res;
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

		let result = TvUtils.checkIntervalArray( this.roadMark, sCheck );

		if ( result == null ) {

			console.warn( 'roadmark not found using default' );

			result = new TvLaneRoadMark( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.WHITE, 0, '', 0, this );

		}

		return result;

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

	/**
	 * Returns the color for mesh of the lane
	 * @returns {string}
	 */
	getColor (): string {

		if ( this.attr_type === 'driving' ) {

			return '#aeaeae';

		} else if ( this.attr_type === 'border' ) {

			return '#118400';

		} else if ( this.attr_type === 'stop' ) {

			return '#848484';
		}

		return '#ff00ab';
	}

	// clones the entire lane
	clone ( id?: number ): TvLane {

		const laneId = id || this.id;

		const newLane = new TvLane( this.side, laneId, this.type, this.level, this.roadId, this._laneSection );

		this.getLaneWidthVector().forEach( width => {
			newLane.addWidthRecord( width.s, width.a, width.b, width.c, width.d );
		} );

		this.getLaneRoadMarkVector().forEach( roadMark => {
			newLane.addRoadMarkRecord( roadMark.sOffset, roadMark.type, roadMark.weight, roadMark.color, roadMark.width, roadMark.laneChange, roadMark.height );
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

	public getLaneWidthAt ( s: number ): TvLaneWidth {

		return TvUtils.checkIntervalArray( this.width, s );

	}

	public getRoadMarkAt ( s: number ): TvLaneRoadMark {

		if ( this.roadMark.length === 0 )
			this.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

		return TvUtils.checkIntervalArray( this.roadMark, s );

	}

	getRoadMarks () {

		return this.roadMark;

	}

	addDefaultRoadMark () {

		this.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.WHITE, 0.15, 'none', 0 );

	}

	addRoadMarkInstance ( roadmark: TvLaneRoadMark ) {

		this.roadMark.push( roadmark );

		this.roadMark.sort( ( a, b ) => a.sOffset > b.sOffset ? 1 : -1 );

		// console.log( this.roadMark );

		// this.lastAddedLaneRoadMark = index;
		//
		// return index;
	}

	addWidthRecordInstance ( laneWidth: TvLaneWidth ) {

		this.width.push( laneWidth );

		this.width.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	copyProperties?(): Object {

		return {
			travelDirection: this.travelDirection,
			type: this.type,
			level: this.level,
		}
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

			points.push( this.laneSection.road.getRoadCoordAt( s, t * offset ) );

		}

		return points;
	}

}

