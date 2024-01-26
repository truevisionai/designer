/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from 'app/core/utils/console';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { Vector3 } from 'three';
import { SerializedField } from '../../../core/components/serialization';
import { EntityRef } from '../entity-ref';
import { Position } from '../position';
import { OpenScenarioVersion, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { XmlElement } from "../../../importers/xml.element";

export class RelativeLanePosition extends Position {

	public readonly label: string = 'Relative Lane Position';
	public readonly type = PositionType.RelativeLane;
	public readonly isDependent: boolean = true;

	/**
	 *
	 * @param entityRef Reference entity.
	 * @param dLane The deviation value between the laneId of the lane,
	 * where the reference entity is located, and the target laneId.
	 * @param ds The offset along the road's reference line relative to the
	 * s-coordinate of the reference entity. Mutually exclusive with dsLane. Unit: [m].
	 * @param offset The lateral offset to the center line of the target lane
	 * (along the normal to the road's reference line). Missing value is interpreted as 0.
	 * The positive value means the offset is applied in the direction of the
	 * t-axis being imagined at the target s-position. Unit: [m].
	 * @param dsLane The offset along the center line of the lane, where the
	 * reference entity is located. Mutually exclusive with ds. Unit: [m].
	 * @param orientation
	 */
	constructor (
		entityRef: EntityRef,
		dLane: number,
		ds: number,
		offset: number = 0,
		dsLane: number = 0,
		orientation: Orientation = null
	) {
		super( null, orientation );
		this._dsLane = dsLane;
		this._offset = offset;
		this._ds = ds;
		this._dLane = dLane;
		this._entityRef = entityRef;
		console.log( 'init', this );
	}

	private _entityRef: EntityRef;

	get entityRef (): EntityRef {
		return this._entityRef;
	}

	set entityRef ( value: EntityRef ) {
		this._entityRef = value;
		this.updated.emit();
	}

	private _dLane: number;

	@SerializedField( { type: 'int' } )
	get dLane (): number {
		return this._dLane;
	}

	set dLane ( value: number ) {
		this._dLane = value;
		this.updated.emit();
	}

	private _ds: number;

	@SerializedField( { type: 'float' } )
	get ds (): number {
		return this._ds;
	}

	set ds ( value: number ) {
		this._ds = value;
		this.updated.emit();
	}

	private _offset: number = 0;

	@SerializedField( { type: 'float' } )
	get offset (): number {
		return this._offset;
	}

	set offset ( value: number ) {
		this._offset = value;
		this.updated.emit();
	}

	private _dsLane: number = 0;

	@SerializedField( { type: 'int' } )
	get dsLane (): number {
		return this._dsLane;
	}

	set dsLane ( value: number ) {
		this._dsLane = value;
		this.updated.emit();
	}

	@SerializedField( { type: 'string' } )
	get entityName (): string {
		return this._entityRef.name;
	}

	set entityName ( value: string ) {
		this._entityRef.name = value;
		this.updated.emit();
	}

	static fromXML ( xml: XmlElement ): RelativeLanePosition {

		return new RelativeLanePosition(
			new EntityRef( xml.attr_entityRef ),
			xml.attr_dLane,
			xml.attr_ds,
			xml.attr_offset,
			xml.attr_dsLane,
			Orientation.fromXML( xml.Orientation )
		);

	}

	toXML ( version?: OpenScenarioVersion ) {

		return {
			attr_entityRef: this._entityRef?.name,
			attr_dLane: this._dLane,
			attr_ds: this._ds,
			attr_offset: this._offset,
			attr_dsLane: this._dsLane,
			Orientation: this.orientation?.toXML( version ),
		};

	}

	getVectorPosition (): Vector3 {

		console.trace( 'getVectorPosition' );

		if ( !this._entityRef ) TvConsole.info( 'No object reference found for relative lane position' );
		if ( !this._entityRef ) return new Vector3();

		const entity = this._entityRef?.entity;

		if ( !entity ) TvConsole.info( 'No object reference found for relative lane position' );
		if ( !entity ) return new Vector3();

		const laneId = entity.laneId + this._dLane;

		const roadId = entity.roadId;

		const sCoordinate = entity.sCoordinate + this._ds;

		const offset = entity.getCurrentLaneOffset() + this._offset;

		return TvMapQueries.getLanePosition( roadId, laneId, sCoordinate, offset );

	}

	updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void {

		throw new Error( 'Method not implemented.' );

	}


}
