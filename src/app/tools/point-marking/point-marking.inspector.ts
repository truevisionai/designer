/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction, SerializedField } from 'app/core/components/serialization';
import { Commands } from 'app/commands/commands';
import { PointMarkingControlPoint } from './objects/point-marking-object';


export class PointMarkingInspector {

	constructor ( public point: PointMarkingControlPoint ) { }

	@SerializedField( { 'type': 'float', label: 'Distance' } )
	get s (): number {
		return this.point.s
	}

	set s ( value ) {
		this.point.s = value;
	}

	@SerializedField( { 'type': 'float', label: 'Offset' } )
	get t (): number {
		return this.point.t;
	}

	set t ( value ) {
		this.point.t = value;
	}

	@SerializedField( {
		type: 'float',
		label: 'Z Offset',
		description: 'z-offset of object origin relative to the elevation of the road reference line'
	} )
	get zOffset (): number {
		return this.point.roadObject.zOffset || 0;
	}

	set zOffset ( value ) {
		this.point.roadObject.zOffset = value;
	}

	@SerializedField( {
		type: 'float',
		label: 'Heading Angle',
		description: 'Heading angle of the object relative to road direction'
	} )
	get heading (): number {
		return this.point.roadObject.hdg || 0;
	}

	set heading ( value ) {
		this.point.roadObject.hdg = value;
	}

	@SerializedField( {
		type: 'float',
		label: 'Width',
		description: 'Width of the object'
	} )
	get width (): number {
		return this.point.roadObject.width;
	}

	set width ( value ) {
		this.point.roadObject.width = value;
	}

	@SerializedField( {
		type: 'float',
		label: 'Length',
		description: 'Length of the object'
	} )
	get length (): number {
		return this.point.roadObject.length;
	}

	set length ( value ) {
		this.point.roadObject.length = value;
	}

	@SerializedAction( { label: 'Delete' } )
	delete (): void {
		Commands.RemoveObject( this.point, true );
	}

}


export class MultiPointMarkingInspector {

	constructor ( public points: PointMarkingControlPoint[] ) { }

	get items () { return this.points.map( point => point.roadObject ); }

	getValue<T, K extends keyof T> ( items: T[], key: K, multi = true ): T[ K ] {

		if ( items.length > 1 ) {

			return multi ? items[ 0 ][ key ] : undefined;

		} else if ( items.length == 1 ) {

			return items[ 0 ][ key ];

		}

	}

	setValue<T, K extends keyof T> ( items: T[], key: K, value: T[ K ], multi = true ) {

		if ( items.length > 1 ) {

			if ( multi ) {

				items.forEach( obj => obj[ key ] = value );

			}

		} else if ( items.length == 1 ) {

			items[ 0 ][ key ] = value;

		}

	}

	@SerializedField( { 'type': 'float', label: 'Distance' } )
	get s () {

		return this.getValue( this.items, 's', false );

	}

	set s ( value ) {

		this.setValue( this.items, 's', value, false );

	}

	@SerializedField( { 'type': 'float', label: 'Offset' } )
	get t () {

		return this.getValue( this.items, 't', true );

	}

	set t ( value ) {

		this.setValue( this.items, 't', value, true );

	}

	@SerializedField( {
		type: 'float',
		label: 'Z Offset',
		description: 'z-offset of object origin relative to the elevation of the road reference line'
	} )
	get zOffset () {
		return this.getValue( this.items, 'zOffset', true ) || 0;
	}

	set zOffset ( value ) {
		this.setValue( this.items, 'zOffset', value, true );
	}

	@SerializedField( {
		type: 'float',
		label: 'Heading Angle',
		description: 'Heading angle of the object relative to road direction'
	} )
	get heading () {
		return this.getValue( this.items, 'hdg', true ) || 0;
	}

	set heading ( value ) {
		this.setValue( this.items, 'hdg', value, true );
	}

	@SerializedField( {
		type: 'float',
		label: 'Width',
		description: 'Width of the object'
	} )
	get width () {
		return this.getValue( this.items, 'width', true );
	}

	set width ( value ) {
		this.setValue( this.items, 'width', value, true );
	}

	@SerializedField( {
		type: 'float',
		label: 'Length',
		description: 'Length of the object'
	} )
	get length () {
		return this.getValue( this.items, 'length', true );
	}

	set length ( value ) {
		this.setValue( this.items, 'length', value, true );
	}

	@SerializedAction( { label: 'Delete' } )
	delete () {

		this.points.forEach( point => Commands.RemoveObject( point, true ) );

	}

}
