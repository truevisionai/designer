/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneSpeed {
    public attr_sOffset;
    public attr_max;
    public attr_unit;

    constructor ( sOffset: number, max: number, unit: string ) {
        this.attr_sOffset = sOffset;
        this.attr_max = max;
        this.attr_unit = unit;
    }

    get sOffset () {
        return this.attr_sOffset;
    }

    set sOffset ( value ) {
        this.attr_sOffset = value;
    }

    get max () {
        return this.attr_max;
    }

    set max ( value ) {
        this.attr_max = value;
    }

    get unit () {
        return this.attr_unit;
    }

    set unit ( value ) {
        this.attr_unit = value;
    }
}