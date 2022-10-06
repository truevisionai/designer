/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Material } from 'three';

export class TvRoadSign {

    public static readonly tag = 'road-sign';

    public static index = 0;

    public id: number;

    constructor (
        public name: string,
        public material: Material,
        public width: number = 1.0,
        public height: number = 1.0,
        public preserveAspectRatio = true,
        public pixelsPerMeter = 256,
        public roundedCorners = false,
        public clampTexture = false
    ) {
        this.id = TvRoadSign.index++;
    }

    toJSONString (): string {

        return JSON.stringify( this );

    }

}
