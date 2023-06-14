/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ActionCategory, DynamicsShape } from '../tv-enums';
import { AbstractAction, AbstractPrivateAction } from '../tv-interfaces';

export class DontUse_PrivateAction extends AbstractPrivateAction {
	actionType: import( '../tv-enums' ).ActionType;

	public category = ActionCategory.private;

	public actionName: string = '';

	private Actions: AbstractAction[] = [];

	get actions () {

		return this.Actions;

	}

	exportXml () {

		return {};

	}

}


export class LaneChangeDynamics {


	constructor (
		public time?: number,
		public distance?: number,
		public shape?: DynamicsShape,
		public rate?: number,
	) {
	}

}

export class SpeedDynamics {

	public shape: DynamicsShape;
	public time?: number;
	public distance?: number;
	public rate?: number;

	constructor ( shape: DynamicsShape = null, time: number = 0, distance: number = 0, rate: number = 0 ) {
		this.shape = shape;
		this.time = time;
		this.distance = distance;
		this.rate = rate;
	}

}

