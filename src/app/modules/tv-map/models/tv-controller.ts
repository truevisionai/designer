/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvController {

    constructor ( id: number, name: string, sequence?: number ) {
        this._id = id;
        this._name = name;
        this._sequence = sequence;
    }

    private _controls: TvControllerControl[] = [];

    get controls (): TvControllerControl[] {
        return this._controls;
    }

    set controls ( value: TvControllerControl[] ) {
        this._controls = value;
    }

    private _id: number;

    get id (): number {
        return this._id;
    }

    set id ( value: number ) {
        this._id = value;
    }

    private _name: string;

    get name (): string {
        return this._name;
    }

    set name ( value: string ) {
        this._name = value;
    }

    private _sequence: number;

    get sequence (): number {
        return this._sequence;
    }

    set sequence ( value: number ) {
        this._sequence = value;
    }

    addControl ( odControllerControl: TvControllerControl ) {
        this.controls.push( odControllerControl );
    }
}

export class TvControllerControl {

    constructor ( signalId: number, type: string ) {
        this._signalId = signalId;
        this._type = type;
    }

    private _signalId: number;

    get signalId (): number {
        return this._signalId;
    }

    set signalId ( value: number ) {
        this._signalId = value;
    }

    private _type: string;

    get type (): string {
        return this._type;
    }

    set type ( value: string ) {
        this._type = value;
    }

}
