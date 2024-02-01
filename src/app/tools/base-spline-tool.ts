/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HasSpline } from "../core/interfaces/data.service";
import { BaseTool } from "./base-tool";

export abstract class BaseSplineTool<T extends HasSpline> extends BaseTool<T> {

}
