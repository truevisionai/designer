/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractPrivateAction } from '../abstract-private-action';
import { ActionType } from '../tv-enums';

export class DistanceAction extends AbstractPrivateAction {

	public actionName: string = 'Distance';
	public actionType: ActionType = ActionType.Private_Longitudinal_Distance;


}
