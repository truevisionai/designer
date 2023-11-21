import { Action, SerializedField } from "app/core/components/serialization";
import { TvRoadObject } from "./tv-road-object";
import { TvObjectMarking } from "../tv-object-marking";
import { CommandHistory } from "app/services/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";

export class MarkingObjectInspectorData {

	constructor ( private roadObject: TvRoadObject, private _marking?: TvObjectMarking ) { }

	@SerializedField( { type: 'object' } )
	get marking () {
		return this._marking || this.roadObject.markings[ 0 ];
	}

	@Action( { name: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.roadObject ) );

	}
}
