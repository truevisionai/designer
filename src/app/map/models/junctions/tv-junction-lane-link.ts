/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TurnType } from '../tv-common';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';
import { TvJunctionConnection } from "../connections/tv-junction-connection";
import { TvLaneCoord } from '../tv-lane-coord';

export class TvJunctionLaneLink {

	public incomingLane: TvLane;
	public connectingLane: TvLane;

	/**
	 * can be useful to track if the link is modified
	 * for exporting as link connection or different
	 */
	public dirty: boolean = false;

	public turnType: TurnType;

	private connection: TvJunctionConnection;

	/**
	 *
	 * @param from ID of the incoming lane
	 * @param to ID of the connecting lane
	 */
	constructor ( from: TvLane, to: TvLane ) {
		this.incomingLane = from;
		this.connectingLane = to;
	}

	get from (): number {
		return this.incomingLane?.id;
	}

	get to (): number {
		return this.connectingLane?.id;
	}

	get connectingRoad (): TvRoad {
		return this.connectingLane.getRoad();
	}

	get incomingRoad (): TvRoad {
		return this.incomingLane.getRoad();
	}

	clone (): TvJunctionLaneLink {
		return new TvJunctionLaneLink( this.incomingLane, this.connectingLane );
	}

	toString (): string {
		return `IncomingLane: ${ this.incomingLane.id } ConnectingLane: ${ this.connectingLane.id } Turn: ${ this.turnType }`;
	}

	matchesIncomingLane ( lane: TvLane ): boolean {
		return this.incomingLane.isEqualTo( lane );
	}

	getOutgoingLane (): TvLane {

		const connectingLane = this.connectingLane;
		const outgoingLaneSection = this.connection.getOutgoingLaneSection();

		return outgoingLaneSection.getLaneById( connectingLane.successorId );

	}

	setConnection ( connection: TvJunctionConnection ): void {
		this.connection = connection;
	}

	getConnection (): TvJunctionConnection {
		return this.connection;
	}

	getIncomingLane (): TvLane {
		return this.incomingLane;
	}

	getConnectingLane (): TvLane {
		return this.connectingLane;
	}

	getIncomingCoord (): TvLaneCoord | undefined {
		return this.connection.getPredecessorLink()?.toLaneCoord( this.getIncomingLane() );
	}

	getOutgoingCoord (): TvLaneCoord | undefined {
		return this.connection.getSuccessorLink()?.toLaneCoord( this.getOutgoingLane() );
	}

}

