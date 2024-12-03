/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { Log } from 'app/core/utils/log';
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

	ngOnInit (): void {

		Log.info( this.data );

	}

	selectTrajectory ( trajectory ): void {

		this.selected = trajectory;

	}

	isDisabled ( trajectory: Trajectory ) {

		return trajectory !== this.selected;

	}
}
