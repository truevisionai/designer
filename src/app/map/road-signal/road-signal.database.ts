/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadSignal } from "./tv-road-signal.model";

export const OpenDriveSignals = {
	TRAFFIC_LIGHT: '1000001',
	STOP_SIGN: '205',
	YIELD_SIGN: '206',
	NO_PARKING_SIGN: '272',
	STOP_LINE: '294',
};

export class SignalDatabase {

	static models = [

	];

	static textures = [
		{
			name: 'TrafficSignal',
			type: '1000001',
			subtype: '-1',
			country: 'OpenDRIVE',
			url: 'assets/signals/traffic-light.png'
		},
		{
			name: 'StopSign',
			type: '205',
			subtype: '-1',
			country: 'OpenDRIVE',
			url: 'http://www.vzkat.de/2017/Teil03/205.gif'
		},
		{
			name: 'YieldSign',
			type: '206',
			subtype: '-1',
			country: 'OpenDRIVE',
			url: 'http://www.vzkat.de/2017/Teil03/206.gif'
		},
		{
			name: 'Sign_R3-4',
			type: '272',
			subtype: '-1',
			country: 'OpenDRIVE',
			url: 'http://www.vzkat.de/2017/Teil03/272.gif'
		},
		{
			name: 'StopLine',
			type: '294',
			subtype: '-1',
			country: 'OpenDRIVE',
			url: 'http://www.vzkat.de/2017/Teil03/206.gif'
		},
		//{
		//	type: '1000002',
		//	subtype: '-1',
		//	country: 'OpenDRIVE',
		//	url: 'http://www.vzkat.de/2017/Teil03/209.gif'
		//},
		{
			type: 'truevision',
			subtype: 'stop',
			country: 'OpenDRIVE',
			url: 'http://www.vzkat.de/2017/Teil03/209.gif'
		}
	];

	static findBySignal ( signal: TvRoadSignal ): any {

		const model = this.findModel( signal );

		if ( model ) return model;

		const texture = this.findTexture( signal );

		if ( texture ) return texture;

	}

	private static findModel ( signal: TvRoadSignal ): any {

		for ( const model of this.models ) {

			if ( model.type === signal.type && model.subtype === signal.subtype ) {

				return model;

			}

		}

	}

	private static findTexture ( signal: TvRoadSignal ): any {

		for ( const texture of this.textures ) {

			if ( texture.type === signal.type && texture.subtype === signal.subtype ) {

				return texture;

			}

		}

	}

}
