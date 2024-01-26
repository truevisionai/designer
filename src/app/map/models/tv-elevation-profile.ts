/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvElevation } from './tv-elevation';

export class TvElevationProfile {

	constructor ( public elevation: TvElevation[] = [] ) { }

	getElevations (): TvElevation[] {
		return this.elevation;
	}

	getElevation ( i: number ): any {
		return this.elevation[ i ];
	}

	getElevationCount (): number {
		return this.elevation.length;
	}

	addElevation ( s: number, a: number, b: number, c: number, d: number ) {
		this.elevation.push( new TvElevation( s, a, b, c, d ) );
	}

	clone (): TvElevationProfile {

		const profile = new TvElevationProfile();

		profile.elevation = this.elevation.map( elevation => elevation.clone( elevation.s ) );

		return profile;
	}

}
