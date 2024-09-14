import { PointMarkingControlPoint } from "../objects/point-marking-object";
import { ObjectTagStrategy } from "app/core/strategies/select-strategies/object-tag-strategy";

export class PointMarkingSelector extends ObjectTagStrategy<PointMarkingControlPoint> {

	constructor () {
		super( PointMarkingControlPoint.TAG );
	}

}
