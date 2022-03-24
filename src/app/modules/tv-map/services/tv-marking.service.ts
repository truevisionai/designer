/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { Math, ShapeBufferGeometry, BoxBufferGeometry } from 'three';
import * as THREE from 'three';
import { TvRoadMarking } from '../models/tv-road-marking';

export enum MarkingTypes {
    point = 'point',
    curve = 'curve',
}

export class TvMarkingService {

    public static markingChanged = new EventEmitter<TvRoadMarking>();

    private static selectedMarking: TvRoadMarking;

    static get currentMarking () {

        return this.selectedMarking;

    }

    static set currentMarking ( value ) {

        this.selectedMarking = value;

        this.markingChanged.emit( value );

    }
}
