import { Component, Input } from '@angular/core';
import { LaneOffsetAction } from 'app/modules/scenario/models/actions/tv-lane-offset-action';
import { CommandHistory } from '../../../../../services/command-history';
import { SetValueCommand } from '../../../../three-js/commands/set-value-command';
import { PrivateAction } from '../../../models/private-action';
import { DynamicsShape } from '../../../models/tv-enums';
import { Target } from 'app/modules/scenario/models/actions/target';

@Component( {
	selector: 'app-lane-offset-action',
	templateUrl: './lane-offset-action.component.html',
	styleUrls: [ './lane-offset-action.component.scss' ]
} )
export class LaneOffsetActionComponent {

	@Input() action: PrivateAction;

	shapes = DynamicsShape;

	get laneOffsetAction () {

		return this.action as LaneOffsetAction;

	}

	onShapeChanged ( $event: DynamicsShape ) {

		CommandHistory.execute( new SetValueCommand( this.laneOffsetAction, 'dynamicsShape', $event ) );

	}

	onMaxAccelChanged ( $maxLateralAcc: number ) {

		CommandHistory.execute( new SetValueCommand( this.laneOffsetAction, 'maxLateralAcc', $maxLateralAcc ) );


	}

	// onTargetChanged ( $target: AbstractTarget ) {

	// 	this.laneOffsetAction.target = $target;

	// }
}
