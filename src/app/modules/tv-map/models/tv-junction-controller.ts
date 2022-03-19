/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvJunctionController {

    public attr_id: number;
    public attr_type: string;
    public attr_sequence: number;

    constructor ( id: number, type: string, sequence?: number ) {
        this.attr_id = id;
        this.attr_type = type;
        this.attr_sequence = sequence;
    }

    get id (): number {
        return this.attr_id;
    }

    set id ( value ) {
        this.attr_id = value;
    }

    get type (): string {
        return this.attr_type;
    }

    set type ( value ) {
        this.attr_type = value;
    }

    get sequence (): number {
        return this.attr_sequence;
    }

    set sequence ( value ) {
        this.attr_sequence = value;
    }

}
