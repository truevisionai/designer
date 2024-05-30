import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { SerializedAction, SerializedField } from 'app/core/components/serialization';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { CommandHistory } from 'app/services/command-history';
import { MathUtils } from 'three';


export class PointMarkingInspector {

	constructor ( public items: TvRoadObject[] ) { }

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

	@SerializedField( { 'type': 'float', label: 'Z Offset' } )
	get zOffset () {

		return this.getValue( this.items, 'zOffset', true );

	}

	set zOffset ( value ) {

		this.setValue( this.items, 'zOffset', value, true );

	}

	@SerializedField( { 'type': 'vector3', label: 'Rotation' } )
	get rotation () {

		// convert from radians to degrees
		const value = this.getValue( this.items, 'rotation', true );

		value.x = MathUtils.radToDeg( value.x );
		value.y = MathUtils.radToDeg( value.y );
		value.z = MathUtils.radToDeg( value.z );

		return value;

	}

	set rotation ( value ) {

		// convert from degrees to radians
		value.x = MathUtils.degToRad( value.x );
		value.y = MathUtils.degToRad( value.y );
		value.z = MathUtils.degToRad( value.z );

		this.setValue( this.items, 'rotation', value, true );

	}

	@SerializedField( { 'type': 'vector3', label: 'Scale' } )
	get scale () {

		return this.getValue( this.items, 'scale', true );

	}

	set scale ( value ) {

		this.setValue( this.items, 'scale', value, true );

	}

	@SerializedAction( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.items ) );

	}

}
