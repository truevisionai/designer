/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from "three";
import { TurnType, TvContactPoint } from '../tv-common';
import { TvJunction } from '../junctions/tv-junction';
import { TvJunctionLaneLink } from '../junctions/tv-junction-lane-link';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';
import { TvPosTheta } from '../tv-pos-theta';
import { Log } from 'app/core/utils/log';
import { RoadUtils } from 'app/utils/road.utils';
import { TvLink } from '../tv-link';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvLaneSection } from '../tv-lane-section';
import { TvLaneCoord } from "../tv-lane-coord";
import { LaneUtils } from 'app/utils/lane.utils';

const DESC = ( a: TvLane, b: TvLane ) => b.id - a.id;
const ASC = ( a: TvLane, b: TvLane ) => a.id - b.id;

/**

Rules
The following rules apply to connecting roads:
Each connecting road shall be represented by exactly one <connection> element.
A connecting road may contain as many lanes as required.

An incoming road with multiple lanes may be connected to the lanes of the road
leading out off the junction in different ways:

By multiple connecting roads, each with one <laneLink> element for the connection
between two specific lanes. Lane changes within this junction are not possible.

By one connecting road with multiple <laneLink> elements for the connections
between the lanes. Lane changes within this junction are possible.

The linked lanes shall fit smoothly as described for roads (see Section 8.2).
The @connectingRoad attribute shall not be used for junctions with @type="direct".

 **/
export class TvJunctionConnection {

	private readonly uuid: string;

	private _laneLinks: TvJunctionLaneLink[] = [];

	/**
	 * user internally to identity which connections are corner
	 * connections where we can possibly add sidewalks and
	 * non-driving lanes
	 */
	public isCornerConnection: boolean;

	private junction: TvJunction;

	private turnType: TurnType;

	/**
	 *
	 * @param id Unique ID within the junction
	 * @param incomingRoad ID of the incoming road
	 * @param connectingRoad ID of the connecting road
	 * @param contactPoint Contact point on the connecting road
	 */
	constructor (
		public id: number,
		public incomingRoad: TvRoad,
		public connectingRoad: TvRoad,
		public contactPoint: TvContactPoint,
	) {
		this.uuid = MathUtils.generateUUID();

		if ( incomingRoad?.id == connectingRoad?.id ) Log.error( 'InvalidConnection', this.toString() );

	}

	get laneLinks (): TvJunctionLaneLink[] {
		return this._laneLinks;
	}

	setJunction ( junction: TvJunction ): void {
		this.junction = junction;
	}

	getJunction (): TvJunction {
		return this.junction;
	}

	setTurnType ( turnType: TurnType ): void {
		this.turnType = turnType;
	}

	getTurnType (): TurnType {
		return this.turnType;
	}

	setConnectingRoad ( road: TvRoad ): void {
		this.connectingRoad = road;
	}

	getConnectingRoad (): TvRoad {
		return this.connectingRoad;
	}

	get spline (): AbstractSpline {
		return this.connectingRoad.spline;
	}

	get incomingRoadId (): number {
		return this.incomingRoad?.id;
	}

	get connectingRoadId (): number {
		return this.connectingRoad?.id;
	}

	get isRightTurn (): boolean {
		return this.turnType == TurnType.RIGHT;
	}

	get isLeftTurn (): boolean {
		return this.turnType == TurnType.LEFT;
	}

	getIncomingRoad (): TvRoad {
		return this.incomingRoad;
	}

	shouldCreateNonDrivingLinks (): boolean {
		return this.isCornerConnection
	}

	isCorner (): boolean {
		return this.isCornerConnection;
	}

	get connectingLaneSection () {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.connectingRoad.getLaneProfile().getFirstLaneSection();

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return this.connectingRoad.getLaneProfile().getLastLaneSection();

		}

	}

	getRoad (): TvRoad {

		return this.connectingRoad;

	}

	getLaneSection (): TvLaneSection | undefined {

		return this.connectingRoad.getLaneProfile().getLaneSections()[ 0 ];

	}

	getSpline (): AbstractSpline {

		return this.connectingRoad.spline;

	}

	getOutgoingLink (): TvLink | null {

		return this.contactPoint == TvContactPoint.START ? this.getSuccessorLink() : this.getPredecessorLink();

	}

	getIncomingLink (): TvLink | null {

		return this.contactPoint == TvContactPoint.START ? this.getPredecessorLink() : this.getSuccessorLink();

	}

	getOutgoingRoadContact (): TvContactPoint {

		return this.getOutgoingLink()?.contactPoint;

	}

	getPredecessorLink (): TvLink | null {

		if ( this.connectingRoad.predecessor ) {

			return this.connectingRoad.predecessor;

		} else {

			Log.warn( `No predecessor found for road ${ this.connectingRoad.id }` );

		}

	}

	getSuccessorLink (): TvLink | null {

		if ( this.connectingRoad.successor ) {

			return this.connectingRoad.successor

		} else {

			Log.warn( `No successor found for road ${ this.connectingRoad.id }` );

		}

	}

	toString (): string {

		return 'Connection:' + this.id + ' incomingRoad:' + this.incomingRoadId + ' connectingRoad:' + this.connectingRoadId + ' contactPoint:' + this.contactPoint;

	}

	computeIncomingContactPoint (): TvContactPoint {

		const incomingPosition = this.getIncomingPosition();

		return RoadUtils.getContactByPosition( this.incomingRoad, incomingPosition.position );

	}

	getIncomingRoadContact (): TvContactPoint {

		if ( this.connectingRoad.successor?.equals( this.incomingRoad ) ) {
			return this.connectingRoad.successor.contactPoint;
		}

		if ( this.connectingRoad.predecessor?.equals( this.incomingRoad ) ) {
			return this.connectingRoad.predecessor.contactPoint;
		}

		throw new Error( 'Invalid incoming road contact point' );

	}

	getIncomingPosition (): TvPosTheta {

		if ( this.contactPoint == TvContactPoint.START ) {

			return this.connectingRoad.getStartPosTheta();

		} else if ( this.contactPoint == TvContactPoint.END ) {

			return this.connectingRoad.getEndPosTheta();

		}

	}

	clone (): TvJunctionConnection {

		const clone = new TvJunctionConnection( this.id, this.incomingRoad, this.connectingRoad, this.contactPoint );

		clone._laneLinks = this._laneLinks.map( link => link.clone() );

		return clone;

	}

	getJunctionLaneLink ( index: number ): TvJunctionLaneLink {

		return this._laneLinks[ index ];

	}

	getLaneLinks (): TvJunctionLaneLink[] {

		return this._laneLinks;

	}

	getLastLink (): TvJunctionLaneLink | undefined {

		return this._laneLinks[ this._laneLinks.length - 1 ];

	}

	getLinkCount (): number {

		return this._laneLinks.length;

	}

	addLaneLink ( laneLink: TvJunctionLaneLink ): void {

		const exists = this._laneLinks.find( link => link.from == laneLink.from && link.to == laneLink.to );

		if ( exists ) return;

		this._laneLinks.push( laneLink );

		laneLink.setConnection( this );

	}

	addLaneLinks ( links: TvJunctionLaneLink[] ): void {

		links.forEach( link => this.addLaneLink( link ) );

	}

	getConnectingLaneId ( laneId: number ): number {

		for ( const link of this._laneLinks ) {

			if ( link.from == laneId ) {

				return link.to;

			}

		}

		return null;
	}

	getIncomingLaneSection (): TvLaneSection {

		return this.incomingRoad.getLaneProfile().getLaneSectionAtContact( this.getIncomingRoadContact() );

	}

	getOutgoingRoad (): TvRoad | undefined {

		return this.getOutgoingLink()?.getElement() as TvRoad;

	}

	getOutgoingLaneSection (): TvLaneSection | undefined {

		return this.getOutgoingRoad()?.getLaneProfile().getLaneSectionAtContact( this.getOutgoingRoadContact() );

	}

	getOutgoingCoords (): TvLaneCoord[] {

		const outgoingContact = this.getOutgoingRoadContact();

		return this.getOutgoingLanes().map( lane => lane.toLaneCoord( outgoingContact ) );

	}

	getIncomingCoords (): TvLaneCoord[] {

		const incomingContact = this.getIncomingRoadContact();

		return this.getIncomingLanes().map( lane => lane.toLaneCoord( incomingContact ) );

	}

	getIncomingLanes (): TvLane[] {

		const contactPoint = this.getIncomingRoadContact();
		const direction = LaneUtils.determineDirection( contactPoint );
		const side = LaneUtils.findIncomingSide( contactPoint );
		const lanes = this.getIncomingLaneSection().getLanes().filter( lane => lane.side === side );

		return lanes.sort( ( a, b ) => Math.abs( a.id ) - Math.abs( b.id ) );

	}

	getIncomingLaneCount (): number {

		return this.getIncomingLaneSection().getLanes().length;

	}

	getOutgoingLanes (): TvLane[] {

		const contactPoint = this.getOutgoingRoadContact();
		const direction = LaneUtils.determineOutDirection( contactPoint );
		const side = LaneUtils.findOutgoingSide( contactPoint );
		const lanes = this.getOutgoingLaneSection().getLanes().filter( lane => lane.side === side );

		return lanes.sort( ( a, b ) => Math.abs( a.id ) - Math.abs( b.id ) )
	}

	markAsCornerConnection (): void {

		this.isCornerConnection = true;

	}

	setCorner ( isCorner: boolean ): void {

		this.isCornerConnection = isCorner;

	}

	getLowestLaneLink (): TvJunctionLaneLink {

		return this.getLaneLinks().sort( ( a, b ) => a.incomingLane.id - b.incomingLane.id )[ 0 ];

	}

	getHighestLaneLink (): TvJunctionLaneLink {

		return this.getLaneLinks().sort( ( a, b ) => b.incomingLane.id - a.incomingLane.id )[ 0 ];

	}

	getOuterLaneLink (): TvJunctionLaneLink {

		const contactPoint = this.getIncomingRoadContact();

		if ( contactPoint == TvContactPoint.START ) {
			return this.getHighestLaneLink();
		} else {
			return this.getLowestLaneLink();
		}

	}

	private getHash (): string {

		let hash = `${ this.incomingRoadId }_`;

		this._laneLinks.forEach( link => {

			hash += `_${ link.incomingLane.id }`;
			hash += `_${ link.connectingRoad.successor.id }`;
			hash += `_${ link.connectingLane.successorId }`;

		} );

		return hash;
	}

	matches ( target: TvJunctionConnection ): boolean {

		return this.getHash() == target.getHash();

	}

	replaceIncomingRoad ( target: TvRoad, incomingRoad: TvRoad, incomingRoadContact: TvContactPoint ): void {

		if ( this.incomingRoad.equals( target ) ) {
			this.incomingRoad = incomingRoad;
		}

		if ( this.connectingRoad.predecessor?.equals( target ) ) {
			this.connectingRoad.setPredecessorRoad( incomingRoad, incomingRoadContact );
		}

		if ( this.connectingRoad.successor?.equals( target ) ) {
			this.connectingRoad.setSuccessorRoad( incomingRoad, incomingRoadContact );
		}

	}

	isLinkedToRoad ( target: TvRoad ): boolean {

		return this.incomingRoad.equals( target ) ||
			this.getPredecessorLink()?.equals( target ) ||
			this.getSuccessorLink()?.equals( target )

	}

	getEntryCoords (): TvLaneCoord[] {
		throw new Error( 'Method not implemented.' );
	}

	getExitCoords (): TvLaneCoord[] {
		throw new Error( 'Method not implemented.' );
	}

	protected getInnerMostDrivingLane (): TvLane {

		const drivingLanes = this.getIncomingLanes().filter( lane => lane.isDrivingLane );

		const contactPoint = this.getIncomingRoadContact();

		if ( contactPoint == TvContactPoint.END ) {

			return drivingLanes.sort( ( a, b ) => b.id - a.id )[ 0 ];

		} else {

			return drivingLanes.sort( ( a, b ) => a.id - b.id )[ 0 ];

		}

	}

	protected get isIncomingInSameDirection (): boolean {

		return this.contactPoint !== this.getOutgoingRoadContact();

	}

	removeLink ( link: TvJunctionLaneLink ): void {

		this._laneLinks = this._laneLinks.filter( laneLink => laneLink !== link );

	}

	getLinkForIncomingLane ( lane: TvLane ): TvJunctionLaneLink {

		return this._laneLinks.find( link => link.matchesIncomingLane( lane ) );

	}

	hasSidewalks (): boolean {

		return this._laneLinks.some( link => link.connectingLane.isSidewalk );

	}

}

