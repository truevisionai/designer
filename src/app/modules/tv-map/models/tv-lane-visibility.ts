/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneVisibility {
    public attr_sOffset;
    public attr_forward;
    public attr_back;
    public attr_left;
    public attr_right;

    constructor ( sOffset: number, forward: number, back: number, left: number, right: number ) {
        this.attr_sOffset = sOffset;
        this.attr_forward = forward;
        this.attr_back = back;
        this.attr_left = left;
        this.attr_right = right;
    }

    get sOffset () {
        return this.attr_sOffset;
    }

    set sOffset ( value ) {
        this.attr_sOffset = value;
    }

    get forward () {
        return this.attr_forward;
    }

    set forward ( value ) {
        this.attr_forward = value;
    }

    get back () {
        return this.attr_back;
    }

    set back ( value ) {
        this.attr_back = value;
    }

    get left () {
        return this.attr_left;
    }

    set left ( value ) {
        this.attr_left = value;
    }

    get right () {
        return this.attr_right;
    }

    set right ( value ) {
        this.attr_right = value;
    }

}
