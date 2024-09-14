/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IHasPosition } from "app/objects/i-has-position";
import { IHasUpdate } from "../../commands/set-value-command";


export interface IHasCopyUpdate extends IHasUpdate, IHasPosition {
}
