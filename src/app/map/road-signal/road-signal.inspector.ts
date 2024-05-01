/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadSignal } from './tv-road-signal.model';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { Action, SerializedField } from 'app/core/components/serialization';
import { CommandHistory } from 'app/services/command-history';
import { TvOrientation, TvUnit } from 'app/map/models/tv-common';


export class RoadSignalInspector {

	constructor ( public signal: TvRoadSignal ) { }

	@SerializedField( { 'type': 'float', label: 'Road Distance' } )
	get s () {
		return this.signal.s;
	}

	set s ( value ) {
		this.signal.s = value;
	}

	@SerializedField( { 'type': 'float', label: 'Lateral Offset' } )
	get t () {
		return this.signal.t;
	}

	set t ( value ) {
		this.signal.t = value;
	}

	@SerializedField( { 'type': 'float', label: 'Z Offset' } )
	get z () {
		return this.signal.zOffset;
	}

	set z ( value ) {
		this.signal.zOffset = value;
	}


	@SerializedField( { 'type': 'float', label: 'Heading' } )
	get hdg () {
		return this.signal.hOffset;
	}

	set hdg ( value ) {
		this.signal.hOffset = value;
	}

	@SerializedField( { 'type': 'enum', enum: TvUnit } )
	get unit () {
		return this.signal.unit;
	}

	set unit ( value ) {
		this.signal.unit = value;
	}

	@SerializedField( { 'type': 'string' } )
	get value () {
		return this.signal.value;
	}

	set value ( value ) {
		this.signal.value = value;
	}

	@SerializedField( { 'type': 'enum', enum: TvOrientation } )
	get orientation () {
		return this.signal.orientations;
	}

	set orientation ( value ) {
		this.signal.orientations = value;
	}

	@SerializedField( { 'type': 'float', label: 'Height' } )
	get height () {
		return this.signal.height;
	}

	set height ( value ) {
		this.signal.height = value;
	}

	@SerializedField( { 'type': 'float' } )
	get width () {
		return this.signal.width;
	}

	set width ( value ) {
		this.signal.width = value;
	}

	@SerializedField( { 'type': 'string' } )
	get type () {
		return this.signal.type;
	}

	set type ( value ) {
		this.signal.type = value;
	}

	@SerializedField( { 'type': 'string' } )
	get subType () {
		return this.signal.subtype;
	}

	set subType ( value ) {
		this.signal.subtype = value;
	}

	@SerializedField( { 'type': 'string' } )
	get text (): string {
		return this.signal.text;
	}

	set text ( value: string ) {
		this.signal.text = value;
	}

	@Action( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.signal ) );

	}

}
