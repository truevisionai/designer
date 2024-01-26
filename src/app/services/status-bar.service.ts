/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { Vector3 } from 'three';
import { ViewportEvents } from 'app/events/viewport-events';

@Injectable( {
	providedIn: 'root'
} )
export class StatusBarService {

	static message: string = '';
	static messageChanged = new EventEmitter<string>();
	private cursor: PointerEventData;
	private road: TvRoad;
	private pos = new TvPosTheta( 0, 0, 0, 0, 0 );

	// public message = '';

	constructor () {
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

	get coordinates () {
		const x = this.cursor?.point?.x?.toFixed( 1 );
		const y = this.cursor?.point?.y?.toFixed( 1 );
		const z = this.cursor?.point?.z?.toFixed( 1 );
		return `World x: ${ x }, y: ${ y }, z: ${ z }`;
	}

	get roadCoordinates () {
		return `Road: ${ this.roadId }, S: ${ this.s }, T: ${ this.t }`;
	}

	get message () {
		return StatusBarService.message;
	}

	static setHint ( msg: string ) {

		this.setMessage( 'Hint: ' + msg );

	}

	static setMessage ( msg: string ) {

		if ( this.message === msg ) return;

		this.message = msg;

		this.messageChanged.emit( this.message );

	}

	static clearHint () {

		this.message = '';

	}

	onPointerMoved ( data: PointerEventData ) {

		if ( !data?.point ) return;

		this.cursor = data;
		this.road = TvMapQueries.getRoadByCoords( data.point.x, data.point.y, this.pos );

	}


}
