/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneAccess {

    public attr_sOffset;
    public attr_restriction;

    constructor ( sOffset: number, restriction: string ) {
        this.attr_sOffset = sOffset;
        this.attr_restriction = restriction;
    }

    get sOffset () {
        return this.attr_sOffset;
    }

    set sOffset ( value ) {
        this.attr_sOffset = value;
    }

    get restriction () {
        return this.attr_restriction;
    }

    set restriction ( value ) {
        this.attr_restriction = value;
    }
}
