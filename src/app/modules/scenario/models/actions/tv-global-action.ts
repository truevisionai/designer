/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAction } from '../tv-action';
import { ActionCategory } from '../tv-enums';

export abstract class GlobalAction extends TvAction {

	public category = ActionCategory.global;

}
