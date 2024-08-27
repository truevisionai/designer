/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommandHistory } from 'app/commands/command-history';
import { SetValueCommand } from 'app/commands/set-value-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { TvMapHeader } from 'app/map/models/tv-map-header';
import { MapService } from 'app/services/map/map.service';

import proj4 from 'proj4';

function convertToTMerc ( projString: string ): string {
	try {
		const sourceProj = proj4( projString.trim() );
		const sourceDef = sourceProj.oProj;

		const a = sourceDef.a || 6378137;
		const rf = sourceDef.rf || 298.257223563;
		const lonCenter = ( sourceDef.long0 || 0 ) * 180 / Math.PI;
		const latCenter = ( sourceDef.lat0 || 0 ) * 180 / Math.PI;

		let tmercString = `+proj=tmerc +lat_0=${ latCenter } +lon_0=${ lonCenter } +k=1 +x_0=${ sourceDef.x0 || 0 } +y_0=${ sourceDef.y0 || 0 }`;
		tmercString += ` +ellps=${ sourceDef.ellps || 'WGS84' } +units=${ sourceDef.units || 'm' } +no_defs`;

		if ( a !== 6378137 || rf !== 298.257223563 ) {
			tmercString += ` +a=${ a } +rf=${ rf }`;
		}

		return tmercString;

	} catch ( error ) {
		console.error( 'Error converting projection string to TMerc:', error );
		return '+proj=tmerc +lat_0=0 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs';
	}
}

@Component( {
	selector: 'app-world-setting-inspector',
	templateUrl: './world-setting-inspector.component.html',
	styleUrls: [ './world-setting-inspector.component.scss' ]
} )
export class WorldSettingInspectorComponent extends BaseInspector implements OnInit {

	data: TvMapHeader;

	@Input() label: string = 'Inspector';

	isOpen: boolean = true;

	projString: string;

	constructor ( private mapService: MapService ) {

		super()

	}

	ngOnInit () {

		this.data = this.mapService.map.header;

		if ( this.mapService.map.header.geoReference ) {
			this.projString = convertToTMerc( this.mapService.map.header.geoReference );
		}

	}

	clearProjection () {

		const oldValue = this.mapService.map.header;

		const newValue = oldValue.clone().reset();

		CommandHistory.execute( new SetValueCommand( this.mapService.map, 'header', newValue, oldValue ) )

	}

	onLatChanged ( value: any ) {

		CommandHistory.execute( new SetValueCommand( this.data.origin, 'x', parseFloat( value ) ?? 0, this.data.origin.x ) );

	}

	onLongChanged ( value: any ) {

		CommandHistory.execute( new SetValueCommand( this.data.origin, 'y', parseFloat( value ) ?? 0, this.data.origin.y ) );

	}

	onOffsetChanged ( value: any ) {

		try {

			// TODO: add undo/redo support
			this.data.positionOffset.x = parseFloat( value.x ) ?? 0;
			this.data.positionOffset.y = parseFloat( value.y ) ?? 0;

		} catch ( e ) {

			console.error( e );

		}

	}

	onHeadingOffsetChanged ( value: any ) {

		CommandHistory.execute( new SetValueCommand( this.data, 'headingOffset', parseFloat( value ) ?? 0, this.data.headingOffset ) );

	}

}
