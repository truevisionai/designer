import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { OscFollowTrajectoryAction } from '../../../../../models/actions/osc-follow-trajectory-action';
import { ToolManager } from '../../../../../../../core/tools/tool-manager';
import { AppInspector } from '../../../../../../../core/inspector';

@Component( {
	selector: 'app-follow-trajectory-action',
	templateUrl: './follow-trajectory-action.component.html',
	styleUrls: [ './follow-trajectory-action.component.css' ]
} )
export class FollowTrajectoryActionComponent implements OnInit, IComponent, OnDestroy {

	data: OscFollowTrajectoryAction;

	@Input() action: OscFollowTrajectoryAction;

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
