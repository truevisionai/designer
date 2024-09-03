import { SimpleControlPoint } from "../../../objects/simple-control-point";
import { TvCornerRoad } from "../../../map/models/objects/tv-corner-road";
import { TvRoad } from "../../../map/models/tv-road.model";
import { TvRoadObject } from "../../../map/models/objects/tv-road-object";

export class CornerControlPoint extends SimpleControlPoint<TvCornerRoad> {

	public corner: TvCornerRoad;

	constructor ( public road: TvRoad, public roadObject: TvRoadObject, cornerRoad: TvCornerRoad, ) {

		super( cornerRoad );

		this.corner = cornerRoad

	}

}