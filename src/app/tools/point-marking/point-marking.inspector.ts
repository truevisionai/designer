/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { SerializedAction, SerializedField } from 'app/core/components/serialization';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { CommandHistory } from 'app/commands/command-history';
import { SimpleControlPoint } from 'app/objects/simple-control-point';


export class PointMarkingInspector {

	constructor ( public points: SimpleControlPoint<TvRoadObject>[] ) { }

	get items () { return this.points.map( point => point.object ); }

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

		CommandHistory.execute( new RemoveObjectCommand( this.points ) );

	}

}
