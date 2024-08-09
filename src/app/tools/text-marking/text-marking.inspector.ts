/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadSignal } from "app/map/road-signal/tv-road-signal.model";
import { SerializedAction, SerializedField } from "app/core/components/serialization";
import { CommandHistory } from "app/commands/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { TvOrientation } from "app/map/models/tv-common";

export class TextMarkingInspector {

	constructor ( public signal: TvRoadSignal ) { }

	@SerializedField( { 'type': 'float', label: 'Distance' } )
	get s () {
		return this.signal.s;
	}

	set s ( value ) {
		this.signal.s = value;
	}

	@SerializedField( { 'type': 'float', label: 'Offset' } )
	get t () {
		return this.signal.t;
	}

	set t ( value ) {
		this.signal.t = value;
	}

	@SerializedField( { 'type': 'float', label: 'Heading' } )
	get hdg () {
		return this.signal.hOffset;
	}

	set hdg ( value ) {
		this.signal.hOffset = value;
	}

	@SerializedField( { 'type': 'string' } )
	get text (): string {
		return this.signal.text;
	}

	set text ( value: string ) {
		this.signal.text = value;
	}

	@SerializedField( { 'type': 'int', label: 'Font Size' } )
	get value (): number {
		return this.signal.value;
	}

	set value ( value: number ) {
		this.signal.value = value;
	}

	// @SerializedField( { 'type': 'enum', enum: TvUnit } )
	// get unit () {
	// 	return this.signal.unit;
	// }
	// set unit ( value ) {
	// 	this.signal.unit = value;
	// }
	@SerializedField( { 'type': 'float' } )
	get width () {
		return this.signal.width;
	}

	set width ( value ) {
		this.signal.width = value;
	}

	@SerializedField( { 'type': 'enum', label: 'Orientation', enum: TvOrientation } )
	get orientation (): TvOrientation {
		return this.signal.orientation;
	}

	set orientation ( value: TvOrientation ) {
		this.signal.orientation = value;
	}

	@SerializedAction( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.signal ) );

	}

}
