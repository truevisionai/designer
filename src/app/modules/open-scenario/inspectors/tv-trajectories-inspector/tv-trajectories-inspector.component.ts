/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { Debug } from 'app/core/utils/debug';
import { Trajectory } from '../../models/tv-trajectory';

@Component( {
	selector: 'app-tv-trajectories-inspector',
	templateUrl: './tv-trajectories-inspector.component.html',
	styleUrls: [ './tv-trajectories-inspector.component.css' ]
} )
export class TrajectoriesInspectorComponent implements OnInit, IComponent {

	data: Trajectory[] = [];
	selected: any;

	constructor () {
	}

	get trajectories () {
		return this.data;
	};

	ngOnInit () {

		Debug.log( this.data );

	}

	selectTrajectory ( trajectory ) {

		this.selected = trajectory;

	}

	isDisabled ( trajectory: Trajectory ) {

		return trajectory !== this.selected;

	}
}
