/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvElevation } from './tv-elevation';

export class TvElevationProfile {

    public elevation: TvElevation[] = [];

    constructor () {

    }

    getElevations (): TvElevation[] {
        return this.elevation;
    }

    getElevation ( i: number ): any {
        return this.elevation[ i ];
    }

    getElevationCount (): number {
        return this.elevation.length;
    }
}
