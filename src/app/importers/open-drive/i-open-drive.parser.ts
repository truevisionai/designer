/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from "../xml.element";
import { TvMap } from "../../map/models/tv-map.model";

export interface IOpenDriveParser {
	parse ( xml: XmlElement ): TvMap;
}
