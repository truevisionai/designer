/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';

export interface ISign {
    name: string;
    shape: SignShapeType;
}

export enum SignShapeType {
    circle = 'circle',
    square = 'square',
    diamond = 'diamond',
    triangle = 'triangle',
    triangle_inverted = 'triangle_inverted',
    square_tilted = 'square_tilted',
    rectangle = 'rectangle'
}

@Injectable( {
    providedIn: 'root'
} )
export class TvSignService {

    public signChanged = new EventEmitter<ISign>();

    private selectedSign: ISign;

    constructor () {
    }

    get currentSign () {

        return this.selectedSign;

    }

    set currentSign ( value ) {

        this.selectedSign = value;
        this.signChanged.emit( value );

    }

    get signs (): ISign[] {
        return [
            { name: 'stop', shape: SignShapeType.diamond },
            { name: 'no_entry', shape: SignShapeType.circle },
            { name: 'two_way_traffic', shape: SignShapeType.circle },
            { name: 'road_closed', shape: SignShapeType.rectangle },
            { name: 'sharp_left_curve_ahead', shape: SignShapeType.square_tilted },
            { name: 'sharp_right_curve_ahead', shape: SignShapeType.square_tilted },
            { name: 'slow', shape: SignShapeType.square_tilted },
            { name: 'chevron_left', shape: SignShapeType.rectangle },
            { name: 'chevron_right', shape: SignShapeType.rectangle },
        ];
    }
}
