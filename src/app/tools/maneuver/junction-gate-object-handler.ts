/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Commands } from "app/commands/commands";
import { BaseObjectHandler } from "app/core/object-handlers/base-object-handler";
import { Log } from "app/core/utils/log";
import { ConnectionFactory } from "app/factories/connection.factory";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/junctions/tv-junction-connection";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { JunctionGatePoint } from "app/objects/junction-gate-point";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { LaneUtils } from "app/utils/lane.utils";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateHandler extends BaseObjectHandler<JunctionGatePoint> {

	private lastSelected?: JunctionGatePoint;

	constructor (
		private junctionDebugService: JunctionDebugService,
		private connectionFactory: ConnectionFactory
	) {
		super();
	}

	onSelected ( object: JunctionGatePoint ): void {

		if ( this.lastSelected ) {

			this.selected.delete( this.lastSelected );

			this.selected.delete( object );

			this.handleSecondGateSelection( this.lastSelected, object );

			this.lastSelected = null;

		} else {

			object.select();

			this.lastSelected = object;

		}

	}

	onUnselected ( object: JunctionGatePoint ): void {

		setTimeout( () => {

			// HACK: this is a hack to prevent the object from being unselected

			this.lastSelected = null;

			object.unselect();

		}, 100 );

		console.log( 'JunctionGateHandler: onUnselected', object, this.selected );

	}

	onAdded ( object: JunctionGatePoint ): void {

		//

	}

	onUpdated ( object: JunctionGatePoint ): void {

		//

	}

	onRemoved ( object: JunctionGatePoint ): void {

		//

	}

	onDrag ( object: JunctionGatePoint ): void {

		//

	}

	onDragEnd ( object: JunctionGatePoint ): void {

		//

	}

	private handleSecondGateSelection ( first: JunctionGatePoint, second: JunctionGatePoint ): void {

		if ( !this.isValidForConnection( first.coord, second.coord ) ) {
			return;
		}

		const junction = first.coord.getLink().getElement() as TvJunction;

		this.addConnection( junction, first.coord, second.coord );

	}

	private addConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): void {

		const connection = this.createConnection( junction, incoming, outgoing );

		if ( !connection || connection.laneLink.length === 0 ) {
			Log.error( 'Unable to create connection or link' );
			return;
		}

		const link = connection.laneLink[ 0 ];

		while ( junction.hasConnection( connection.id ) ) {
			connection.id = connection.id + 1;
		}

		const mesh = this.junctionDebugService.createManeuver( junction, connection, link );

		if ( !mesh ) {
			Log.error( 'Unable to create maneuver mesh' );
			return;
		}

		Commands.AddObject( mesh );

	}

	private createConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvJunctionConnection | undefined {

		if ( !LaneUtils.canConnect( incoming, outgoing ) ) {
			Log.error( 'Invalid lane directions' );
			return;
		}

		const entry = LaneUtils.isEntry( incoming.lane, incoming.contact ) ? incoming : outgoing;
		const exit = LaneUtils.isExit( outgoing.lane, outgoing.contact ) ? outgoing : incoming;

		if ( entry === exit ) {
			Log.error( 'Invalid entry or exit' );
			return;
		}

		const connection = this.connectionFactory.createSingleConnection( junction, entry, exit );

		if ( !connection ) {
			Log.error( 'Unable to create connection' );
			return;
		}

		return connection;
	}

	private isValidForConnection ( first: TvLaneCoord, second: TvLaneCoord ): boolean {

		if ( first.road == second.road ) {
			this.setHint( 'Cannot connect gates from same roads' );
			return false;
		}

		if ( !LaneUtils.canConnect( first, second ) ) {
			this.setHint( 'Cannot connect gates with invalid lane directions' );
			return false;
		}

		if ( !first.getLink().matches( second.getLink() ) ) {
			this.setHint( 'Cannot connect, invalid links' );
			return false;
		}

		return true;
	}

}

