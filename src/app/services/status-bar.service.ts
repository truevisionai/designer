/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector3 } from 'three';
import { ViewportEvents } from 'app/events/viewport-events';
import { RoadService } from "./road/road.service";
import { TvLane } from 'app/map/models/tv-lane';
import { SnackBar } from "./snack-bar.service";

@Injectable( {
	providedIn: 'root'
} )
export class StatusBarService {

	static messageLogs: string[] = [];

	static message: string = '';

	static messageChanged = new EventEmitter<string>();

	private cursor: PointerEventData;

	private road: TvRoad;

	private lane: TvLane;

	private pos = new TvPosTheta( 0, 0, 0, 0, 0 );

	static snackBar: SnackBar;

	constructor (
		public roadService: RoadService,
		public snackBar: SnackBar,
	) {
		StatusBarService.snackBar = snackBar;
		this.cursor = new PointerEventData();
		this.cursor.point = new Vector3();
		ViewportEvents.instance?.pointerMoved.subscribe( this.onPointerMoved.bind( this ) );
	}

	get x () {
		return this.cursor.point.x;
	}

	get y () {
		return this.cursor.point.y;
	}

	get z () {
		return this.cursor.point.z;
	}

	get s () {
		return this.pos.s ? this.pos.s.toFixed( 1 ) : '';
	}

	get t () {
		return this.pos.t ? this.pos.t.toFixed( 1 ) : '';
	}

	get roadId () {
		return this.road ? this.road.id : '';
	}

	get laneSectionId () {
		return this.lane ? this.lane.laneSectionId : '';
	}

	get laneId () {
		return this.lane ? this.lane.id : '';
	}

	get coordinates () {
		const x = this.cursor?.point?.x?.toFixed( 1 );
		const y = this.cursor?.point?.y?.toFixed( 1 );
		const z = this.cursor?.point?.z?.toFixed( 1 );
		return `World x: ${ x }, y: ${ y }, z: ${ z }`;
	}

	get roadCoordinates () {
		return `Road: ${ this.roadId }, S: ${ this.s }, T: ${ this.t }`;
	}

	// get roadCoordinates () {
	// 	return `Road: ${ this.roadId }, LaneSection: ${this.laneSectionId} Lane: ${this.laneId} S: ${ this.s }, T: ${ this.t }`;
	// }

	get message () {
		return StatusBarService.message;
	}

	static setHint ( msg: string ): void {

		if ( msg == '' || msg == null ) return;

		const hint = 'Hint: ' + msg;

		this.setMessage( hint, true );

		// // check message logs if last 2 messages are same then show snackbar
		// if ( this.messageLogs.length > 1 && this.messageLogs[ this.messageLogs.length - 1 ] === this.messageLogs[ this.messageLogs.length - 2 ] ) {
		// 	this.snackBar.warn( hint );
		// }
	}

	static setError ( msg: string ): void {

		if ( msg == '' || msg == null ) return;

		this.setMessage( `Error: ${ msg }`, true );

	}

	static setMessage ( msg: string, force: boolean = false ): void {

		if ( !force && this.message === msg ) return;

		this.message = msg;

		this.messageChanged.emit( this.message );

		// only keep last 5 message logs
		this.messageLogs.push( msg );

		if ( this.messageLogs.length > 5 ) {
			this.messageLogs.shift();
		}

	}

	static clearHint (): void {

		this.message = '';

	}

	onPointerMoved ( data: PointerEventData ): void {

		if ( !data?.point ) return;

		this.cursor = data;

		this.road = this.roadService.findNearestRoad( data.point, this.pos );

		// const coord = this.roadService.findLaneCoord( data.point );

		// if ( !coord ) {
		// 	this.road = undefined;
		// 	this.pos.s = undefined;
		// 	this.pos.t = undefined;
		// 	this.lane = undefined;
		// } else {
		// 	this.road = coord.road;
		// 	this.pos.s = coord.s;
		// 	this.pos.t = coord.offset;
		// 	this.lane = coord.lane;
		// }
	}

}
