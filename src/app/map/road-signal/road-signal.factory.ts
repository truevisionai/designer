/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvDynamicTypes, TvOrientation, TvUnit } from 'app/map/models/tv-common';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { Asset } from 'app/core/asset/asset.model';
import { RoadSignalIdService } from "./road-signal-id.service";

const POLE_SIGN_ZOFFSET = 2.0;
const ROAD_SIGN_HEIGHT = 0.5;
const ROAD_SIGN_WIDTH = 0.5;

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalFactory {

	constructor (
		private idService: RoadSignalIdService
	) {
	}

	createTrafficLight ( roadCoord: TvRoadCoord, name: string, type: string, subType: string ) {

		const signal = this.createRoadSignal( roadCoord, name, type, subType );

		signal.zOffset = 3.0;
		signal.height = 0.5;
		signal.width = 0.3;

		return signal;

	}

	createPoledSign ( coord: TvRoadCoord, name: string, type: string, subtype: string = '-1' ) {

		const signal = this.createRoadSignal( coord, name, type, subtype );

		signal.zOffset = POLE_SIGN_ZOFFSET;

		return signal;

	}

	createStopLine ( coord: TvRoadCoord, name: string, type: string, subtype: string = '-1' ) {

		const signal = this.createRoadSignal( coord, name, type, subtype );

		signal.zOffset = 0.05;
		signal.height = 0.03;
		signal.width = 3.75;

		return signal;

	}

	createRoadSignal ( coord: TvRoadCoord, name: string, type: string, subtype: string = '-1' ) {

		const signal = this.createSignal( coord.s, coord.t, name );

		signal.type = type;
		signal.subtype = subtype;
		signal.dynamic = TvDynamicTypes.NO;
		signal.name = name;
		signal.text = 'none';
		signal.zOffset = 0.005;
		signal.country = 'OpenDRIVE';
		signal.roadId = coord.road.id;
		signal.unit = TvUnit.NONE;
		signal.value = null;
		signal.height = ROAD_SIGN_HEIGHT;
		signal.width = ROAD_SIGN_WIDTH;

		return signal;

	}

	createSignalFromAsset ( asset: Asset, coord: TvRoadCoord, name: string, type: string = 'truevision', subtype: string = 'stop' ) {

		const signal = this.createSignal( coord.s, coord.t, name );

		signal.type = type;
		signal.subtype = subtype;
		signal.dynamic = TvDynamicTypes.NO;
		signal.name = name;
		signal.text = name;
		signal.orientation = coord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;
		signal.zOffset = POLE_SIGN_ZOFFSET;
		signal.country = 'OpenDRIVE';
		signal.roadId = coord.road.id;
		signal.unit = TvUnit.NONE;
		signal.value = null;
		signal.height = ROAD_SIGN_HEIGHT;
		signal.width = ROAD_SIGN_WIDTH;

		signal.assetGuid = asset.guid;

		return signal;

	}

	createTextRoadMarking ( coord: TvRoadCoord, text: string ) {

		const signal = this.createSignal( coord.s, coord.t, text );

		signal.type = 'roadMark';
		signal.subtype = 'text';
		signal.dynamic = TvDynamicTypes.NO;
		signal.name = text;
		signal.text = text;
		signal.orientation = coord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;
		signal.zOffset = 0.005;
		signal.country = 'OpenDRIVE';
		signal.roadId = coord.road.id;
		signal.unit = TvUnit.T;
		signal.value = 0.8;

		return signal;
	}

	private createSignal ( s: number, t: number, name: string ) {

		const id = this.getNextId();

		return new TvRoadSignal( s, t, id, name );

	}

	private getNextId () {

		return this.idService.getNextId();

	}
}
