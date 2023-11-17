import { XmlElement } from "../xml.element";
import { TvMap } from "../../modules/tv-map/models/tv-map.model";

export interface IOpenDriveParser {
	parse ( xml: XmlElement ): TvMap;
}
