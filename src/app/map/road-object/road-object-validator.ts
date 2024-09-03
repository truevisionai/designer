import { ValidationException } from "app/exceptions/exceptions";
import { TvRoadObject } from "../models/objects/tv-road-object";

export class RoadObjectValidator {

	static validateRoadObject ( roadObject: TvRoadObject ): void {

		if ( !roadObject.road ) {
			throw new ValidationException( 'Road object not attached to road' );
		}

		if ( roadObject.s < 0 || roadObject.s > roadObject.road.getLength() ) {
			throw new ValidationException( 'Road object s value out of bounds' );
		}

	}

}
