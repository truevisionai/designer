/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractAction } from '../abstract-action';
import { ActionCategory } from '../tv-enums';

export abstract class GlobalAction extends AbstractAction {

	public category = ActionCategory.global;

}
