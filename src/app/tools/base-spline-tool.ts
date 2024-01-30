/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HasSpline } from "../services/debug/data.service";
import { BaseTool } from "./base-tool";

export abstract class BaseSplineTool<T extends HasSpline> extends BaseTool<T> {

}
