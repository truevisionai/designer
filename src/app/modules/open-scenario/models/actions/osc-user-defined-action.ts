/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ActionCategory } from '../osc-enums';
import { AbstractAction } from '../osc-interfaces';

export abstract class UserDefinedAction extends AbstractAction {

	public category = ActionCategory.userDefined;

}
