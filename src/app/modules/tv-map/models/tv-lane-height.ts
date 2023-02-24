/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneHeight {
    public attr_sOffset;
    public attr_inner = 0;
    public attr_outer = 0;

    constructor ( sOffset: number, inner: number, outer: number ) {
        this.attr_sOffset = sOffset;
        this.attr_inner = inner;
        this.attr_outer = outer;
    }

    get sOffset () {
        return this.attr_sOffset;
    }

    set sOffset ( value ) {
        this.attr_sOffset = value;
    }

    get outer () {
        return this.attr_outer;
    }

    get inner () {
        return this.attr_inner;
    }

    getOuter () {
        return this.attr_outer;
    }

    setOuter ( value ) {
        this.attr_outer = value;
    }

    getInner () {
        return this.attr_inner;
    }

    setInner ( value ) {
        this.attr_inner = value;
    }

}
