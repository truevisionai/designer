/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ActionType } from '../tv-enums';
import { AbstractPrivateAction } from '../tv-interfaces';

export class DistanceAction extends AbstractPrivateAction {

	public actionName: string = 'Distance';
	public actionType: ActionType = ActionType.Private_Longitudinal_Distance;


}
