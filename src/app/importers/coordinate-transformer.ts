/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMap } from 'app/map/models/tv-map.model';
import { Vector2 } from 'three';
import { Log } from 'app/core/utils/log';

import proj4 from 'proj4';

export class CoordinateTransformer {

	private sourceProj: proj4.Converter;

	constructor ( projString: string ) {
		this.sourceProj = proj4( projString.trim() );
	}

	transformCoordinates ( x: number, y: number ): [ number, number ] {
		try {
			return this.sourceProj.inverse( [ x, y ] );
			// return proj4( this.sourceProj, [ x, y ] );
		} catch ( error ) {
			Log.error( 'Error transforming coordinates:', error );
			return [ x, y ];
		}
	}

	applyOffset ( map: TvMap ): void {

		if ( !map.header.geoReference ) {
			Log.warn( 'No geoReference found in map header. Skipping coordinate transformation.' );
			return;
		}

		map.roads.forEach( road => {
			road.geometries.forEach( geometry => {

				const [ xTM, yTM ] = this.transformCoordinates( geometry.x, geometry.y );

				// Apply scaling and centering
				geometry.x = ( xTM );
				geometry.y = ( yTM );

				geometry.computeVars();
			} );
		} );
	}
}


// function convertToTMerc ( projString: string ): string {
// 	try {
// 		// Parse the input projection string
// 		const sourceProj = proj4( projString.trim() );

// 		// Get the properties of the source projection
// 		const sourceDef = sourceProj.oProj;

// 		// Extract relevant parameters
// 		const a = sourceDef.a || 6378137; // semi-major axis, default to WGS84
// 		const rf = sourceDef.rf || 298.257223563; // inverse flattening, default to WGS84
// 		const lonCenter = ( sourceDef.long0 || 0 ) * 180 / Math.PI; // convert radians to degrees
// 		const latCenter = ( sourceDef.lat0 || 0 ) * 180 / Math.PI; // convert radians to degrees

// 		// Construct TMerc string
// 		let tmercString = `+proj=tmerc +lat_0=${ latCenter } +lon_0=${ lonCenter } +k=1 +x_0=0 +y_0=0`;
// 		tmercString += ` +ellps=WGS84 +units=m +no_defs`;

// 		// If the source projection is not WGS84, add its ellipsoid parameters
// 		if ( a !== 6378137 || rf !== 298.257223563 ) {
// 			tmercString += ` +a=${ a } +rf=${ rf }`;
// 		}

// 		return tmercString;

// 	} catch ( error ) {
// 		console.error( 'Error converting projection string to TMerc:', error );
// 		return '+proj=tmerc +lat_0=0 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs'; // Return default TMerc string in case of error
// 	}
// }

export function convertToTMerc ( projString: string ): string {
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

export function convertToWGS84String ( projString: string ): string {
	try {
		// Parse the input projection string
		const sourceProj = proj4( projString.trim() );

		// Create a WGS84 projection
		const wgs84Proj = proj4( 'EPSG:4326' );

		// Get the properties of the source projection
		const sourceDef = sourceProj.oProj;

		// Extract relevant parameters
		const a = sourceDef.a; // semi-major axis
		const rf = sourceDef.rf; // inverse flattening
		const lonCenter = sourceDef.long0 * 180 / Math.PI; // convert radians to degrees
		const latCenter = sourceDef.lat0 * 180 / Math.PI; // convert radians to degrees

		// Construct WGS84 string
		let wgs84String = '+proj=longlat +datum=WGS84 +no_defs';

		// If the source projection is not already WGS84, add more parameters
		if ( a !== 6378137 || rf !== 298.257223563 ) {
			wgs84String += ` +a=${ a } +rf=${ rf }`;
		}

		// If there's a defined center, add it
		if ( lonCenter !== 0 || latCenter !== 0 ) {
			wgs84String += ` +lon_0=${ lonCenter } +lat_0=${ latCenter }`;
		}

		return wgs84String;

	} catch ( error ) {
		console.error( 'Error converting projection string:', error );
		return '+proj=longlat +datum=WGS84 +no_defs'; // Return default WGS84 string in case of error
	}
}

export function getWorldProjection ( projString: string, ) {

	try {

		const sourceProj = proj4( projString.trim() );

		const destProj = proj4( 'EPSG:3857' );

		return proj4( sourceProj, destProj );

	} catch ( error ) {

		console.error( 'Error transforming coordinates:', error );

	}

}

export function getWorldOriginInLatLong ( projString: string ) {

	try {

		const sourceProj = proj4( projString.trim() );

		const wgs84Proj = proj4( 'EPSG:4326' ); // WGS84

		// Transform [0, 0] from the source projection to WGS84
		const [ lon, lat ] = proj4( sourceProj, wgs84Proj, [ 0, 0 ] );

		return [ lat, lon ]; // Return as [latitude, longitude]

	} catch ( error ) {

		console.error( 'Error transforming coordinates:', error );

		return [ 0, 0 ]; // Return a default value in case of error

	}

}

export function transformCoordinates ( projString: string, x: number, y: number ): [ number, number ] {

	if ( !projString ) return [ x, y ];

	try {

		const sourceProj = proj4( projString.trim() );

		// for threejs
		const destProj = proj4( 'EPSG:3857' );

		return proj4( sourceProj, destProj, [ x, y ] );

	} catch ( error ) {

		console.error( 'Error transforming coordinates:', error );
		return [ x, y ];
	}

}
