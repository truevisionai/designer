/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { TvMap } from 'app/map/models/tv-map.model';

@Component( {
	selector: 'app-xodr-file-inspector',
	templateUrl: './xodr-file-inspector.component.html',
	styleUrls: [ './xodr-file-inspector.component.scss' ]
} )
export class XodrFileInspectorComponent implements OnInit, IComponent {

	data: TvMap;

	constructor () {
	}

	ngOnInit () {
	}

}
