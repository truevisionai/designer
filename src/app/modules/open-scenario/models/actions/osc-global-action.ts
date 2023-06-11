/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ActionCategory } from '../osc-enums';
import { AbstractAction } from '../osc-interfaces';

export abstract class GlobalAction extends AbstractAction {

	public category = ActionCategory.global;

}
