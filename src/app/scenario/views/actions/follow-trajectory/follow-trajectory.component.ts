/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { AppInspector } from '../../../../core/inspector';
import { ToolManager } from '../../../../managers/tool-manager';
import { TvAction } from 'app/scenario/models/tv-action';
import { FollowTrajectoryAction } from 'app/scenario/models/actions/tv-follow-trajectory-action';
import { ActionType } from 'app/scenario/models/tv-enums';

@Component( {
	selector: 'app-follow-trajectory',
	templateUrl: './follow-trajectory.component.html',
	styleUrls: [ './follow-trajectory.component.css' ]
} )
export class FollowTrajectoryComponent implements OnInit, IComponent, OnDestroy {

	data: FollowTrajectoryAction;

	@Input() action: TvAction;

	get trajectory () {

		return this.action as any;
	}

	constructor () { }

	ngOnInit (): void {

		ToolManager.disable();

		if ( this.action.actionType !== ActionType.Private_Routing_FollowTrajectory ) {
			throw new Error( 'Invalid action type' );
		}

		this.data = this.action as FollowTrajectoryAction;

	}

	ngOnDestroy (): void {

		ToolManager.enable();

	}

	onExit (): void {

		AppInspector.clear();

	}
}
