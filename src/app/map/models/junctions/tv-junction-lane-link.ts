/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TurnType } from '../tv-common';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';
import { TvJunctionConnection } from "../connections/tv-junction-connection";
import { TvLaneCoord } from '../tv-lane-coord';

export class TvJunctionLaneLink {

	private readonly _incomingLane: TvLane;
	private readonly _connectingLane: TvLane;

	/**
	 * can be useful to track if the link is modified
	 * for exporting as link connection or different
	 */
	public dirty: boolean = false;

	private turnType: TurnType;

	private connection: TvJunctionConnection;

	constructor ( incomingLane: TvLane, connectingLane: TvLane ) {
		this._incomingLane = incomingLane;
		this._connectingLane = connectingLane;
	}

	get connectingLane (): TvLane {
		return this._connectingLane;
	}

	get incomingLane (): TvLane {
		return this._incomingLane;
	}

	get from (): number {
		return this._incomingLane.id;
	}

	get to (): number {
		return this._connectingLane.id;
	}

	get connectingRoad (): TvRoad {
		return this._connectingLane.getRoad();
	}

	get incomingRoad (): TvRoad {
		return this._incomingLane.getRoad();
	}

	clone (): TvJunctionLaneLink {
		return new TvJunctionLaneLink( this._incomingLane, this._connectingLane );
	}

	toString (): string {
		return `IncomingLane: ${ this._incomingLane.id } ConnectingLane: ${ this._connectingLane.id } Turn: ${ this.turnType }`;
	}

	matchesIncomingLane ( lane: TvLane ): boolean {
		return this._incomingLane.equals( lane );
	}

	getOutgoingLane (): TvLane {

		const connectingLane = this._connectingLane;
		const outgoingLaneSection = this.connection.getOutgoingLaneSection();

		return outgoingLaneSection.getLaneById( connectingLane.successorId );

	}

	setConnection ( connection: TvJunctionConnection ): void {
		this.connection = connection;
	}

	getIncomingLane (): TvLane {
		return this._incomingLane;
	}

	getConnectingLane (): TvLane {
		return this._connectingLane;
	}

	getIncomingCoord (): TvLaneCoord | undefined {
		return this.connection.getPredecessorLink()?.toLaneCoord( this.getIncomingLane() );
	}

	getOutgoingCoord (): TvLaneCoord | undefined {
		return this.connection.getSuccessorLink()?.toLaneCoord( this.getOutgoingLane() );
	}

	isLinkedToLane ( lane: TvLane ): boolean {
		return this.incomingLane.equals( lane ) || this.connectingLane.isSuccessor( lane ) || this.connectingLane.isPredecessor( lane );
	}
}

