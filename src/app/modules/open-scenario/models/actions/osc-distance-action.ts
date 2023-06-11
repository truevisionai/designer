/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ActionType } from '../osc-enums';
import { AbstractPrivateAction } from '../osc-interfaces';

export class DistanceAction extends AbstractPrivateAction {

	public actionName: string = 'Distance';
	public actionType: ActionType = ActionType.Private_Longitudinal_Distance;


}
