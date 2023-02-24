/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable( {
    providedIn: 'root'
} )
export class InputService {

    public isShiftKeyDown: boolean;

    @Output() shiftKeyDown = new EventEmitter<boolean>();

    constructor () {

        this.shiftKeyDown.subscribe( value => this.isShiftKeyDown = value );

    }
}
