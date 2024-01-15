import { TvRoadSignal } from '../../modules/tv-map/models/tv-road-signal.model';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { Action, SerializedField } from 'app/core/components/serialization';
import { CommandHistory } from 'app/services/command-history';
import { TvUnit } from 'app/modules/tv-map/models/tv-common';


export class RoadSignalInspector {

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

	@SerializedField( { 'type': 'enum', enum: TvUnit } )
	get unit () {
		return this.signal.unit;
	}

	set unit ( value ) {
		this.signal.unit = value;
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

	@Action( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.signal ) );

	}

}
