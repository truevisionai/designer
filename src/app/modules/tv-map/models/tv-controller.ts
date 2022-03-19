/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvController {

    private _controls: TvControllerControl[] = [];
    private _id: number;
    private _name: string;
    private _sequence: number;

    constructor ( id: number, name: string, sequence?: number ) {
        this._id = id;
        this._name = name;
        this._sequence = sequence;
    }

    get controls (): TvControllerControl[] {
        return this._controls;
    }

    set controls ( value: TvControllerControl[] ) {
        this._controls = value;
    }

    get id (): number {
        return this._id;
    }

    set id ( value: number ) {
        this._id = value;
    }

    get name (): string {
        return this._name;
    }

    set name ( value: string ) {
        this._name = value;
    }

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

    private _signalId: number;
    private _type: string;

    constructor ( signalId: number, type: string ) {
        this._signalId = signalId;
        this._type = type;
    }

    get type (): string {
        return this._type;
    }

    set type ( value: string ) {
        this._type = value;
    }

    get signalId (): number {
        return this._signalId;
    }

    set signalId ( value: number ) {
        this._signalId = value;
    }

}
