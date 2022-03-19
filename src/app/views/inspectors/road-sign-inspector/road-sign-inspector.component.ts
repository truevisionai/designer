/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { TvRoadSign } from '../../../modules/tv-map/models/tv-road-sign.model';

@Component( {
    selector: 'app-road-sign-inspector',
    templateUrl: './road-sign-inspector.component.html',
    styleUrls: [ './road-sign-inspector.component.css' ]
} )
export class RoadSignInspector implements OnInit, IComponent {

    public data: TvRoadSign;

    constructor () { }

    ngOnInit () { }

}
