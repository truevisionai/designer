/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { AppInspector } from '../../../../core/inspector';
import { ToolManager } from '../../../../managers/tool-manager';
import { FollowTrajectoryAction } from '../../../models/actions/tv-follow-trajectory-action';

@Component( {
	selector: 'app-follow-trajectory',
	templateUrl: './follow-trajectory.component.html',
	styleUrls: [ './follow-trajectory.component.css' ]
} )
export class FollowTrajectoryComponent implements OnInit, IComponent, OnDestroy {

	data: FollowTrajectoryAction;

	@Input() action: FollowTrajectoryAction;

	constructor () {
	}

	ngOnInit () {

		ToolManager.disable();

		if ( this.data != null && this.action == null ) {

			this.action = this.data;
		}

	}

	ngOnDestroy (): void {

		ToolManager.enable();

	}


	onExit () {

		AppInspector.clear();

	}
}
