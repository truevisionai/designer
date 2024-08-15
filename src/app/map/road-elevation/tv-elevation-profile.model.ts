/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvUtils } from '../models/tv-utils';
import { TvElevation } from './tv-elevation.model';

export class TvElevationProfile {

	constructor ( public elevation: TvElevation[] = [] ) { }

	getElevations (): TvElevation[] {

		return this.elevation;

	}

	getElevation ( i: number ): TvElevation {

		return this.elevation[ i ];

	}

	getElevationCount (): number {

		return this.elevation.length;

	}

	addElevation ( s: number, a: number, b: number, c: number, d: number ) {

		this.elevation.push( new TvElevation( s, a, b, c, d ) );

	}

	addElevationInstance ( elevation: TvElevation ) {

		this.elevation.push( elevation );

		this.elevation.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	getElevationValue ( s: number ) {

		const elevation = this.getElevationAt( s );

		if ( elevation == null ) return 0;

		return elevation.getValue( s );
	}

	getElevationAt ( s: number ): TvElevation {

		return TvUtils.checkIntervalArray( this.elevation, s );

	}

	removeElevationInstance ( elevation: TvElevation ) {

		const index = this.elevation.indexOf( elevation );

		if ( index > -1 ) {

			this.elevation.splice( index, 1 );

		}

		this.elevation.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		// TvUtils.computeCoefficients( this.elevation, this.length );

	}

	clone (): TvElevationProfile {

		const profile = new TvElevationProfile();

		profile.elevation = this.elevation.map( elevation => elevation.clone( elevation.s ) );

		return profile;
	}

}
