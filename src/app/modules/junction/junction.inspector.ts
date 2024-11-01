/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction, SerializedField } from "app/core/components/serialization";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Commands } from "app/commands/commands";
import { MapEvents } from "app/events/map-events";

export class JunctionInspector {

	constructor (
		public junction: TvJunction
	) {
	}

	@SerializedField( {
		type: 'string',
		disabled: true,
		description: 'Whether the junction is automatic or created manually'
	} )
	get automatic (): string {
		return this.junction.auto ? 'true' : 'false';
	}

	@SerializedField( { type: 'string', disabled: true } )
	get type (): string {
		return this.junction.type
	}

	@SerializedField( {
		type: 'int',
		disabled: true,
		description: 'The number of connections in the junction'
	} )
	get totalConnections (): number {
		return this.junction.getConnectionCount();
	}

	@SerializedField( {
		type: 'int',
		disabled: true,
		description: 'The number of lane links in the junction'
	} )
	get totalLinks (): number {
		return this.junction.getConnections().flatMap( connection => connection.laneLink ).length;
	}

	@SerializedAction( {
		label: 'Delete Junction',
		validate: function () {
			return !this.junction.auto;
		},
		description: 'You can only delete junctions that are not automatic',
	} )
	deleteManeuver (): void {
		Commands.RemoveObject( this.junction );
	}

	@SerializedAction( {
		label: 'Rebuild Junction',
	} )
	rebuild (): void {
		MapEvents.objectUpdated.emit( this.junction );
	}
}
