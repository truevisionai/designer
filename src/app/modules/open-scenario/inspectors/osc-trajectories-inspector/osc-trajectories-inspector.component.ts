import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { Debug } from 'app/core/utils/debug';
import { OscTrajectory } from '../../models/osc-trajectory';

@Component( {
	selector: 'app-osc-trajectories-inspector',
	templateUrl: './osc-trajectories-inspector.component.html',
	styleUrls: [ './osc-trajectories-inspector.component.css' ]
} )
export class OscTrajectoriesInspectorComponent implements OnInit, IComponent {

	data: OscTrajectory[] = [];
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

	isDisabled ( trajectory: OscTrajectory ) {

		return trajectory !== this.selected;

	}
}
