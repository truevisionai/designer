/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvMapHeader {

    public attr_revMajor: number;
    public attr_revMinor: number;
    public attr_name: string;
    public attr_version: number;
    public attr_date: string;
    public attr_north: number;
    public attr_south: number;
    public attr_east: number;
    public attr_west: number;
    public attr_vendor: string;

    constructor (
        revMajor: number,
        revMinor: number,
        name: string,
        version: number,
        date: string,
        north: number,
        south: number,
        east: number,
        west: number,
        vendor: string
    ) {
        this.attr_revMajor = revMajor;
        this.attr_revMinor = revMinor;
        this.attr_name = name;
        this.attr_version = version;
        this.attr_date = date;
        this.attr_north = north;
        this.attr_south = south;
        this.attr_east = east;
        this.attr_west = west;
        this.attr_vendor = vendor;
    }

    get revMajor (): number {
        return this.attr_revMajor;
    }

    get revMinor (): number {
        return this.attr_revMinor;
    }

    get name (): string {
        return this.attr_name;
    }

    get version (): number {
        return this.attr_version;
    }

    get date (): string {
        return this.attr_date;
    }

    get north (): number {
        return this.attr_north;
    }

    get south (): number {
        return this.attr_south;
    }

    get east (): number {
        return this.attr_east;
    }

    get west (): number {
        return this.attr_west;
    }

    get vendor (): string {
        return this.attr_vendor;
    }
}