import { TvRoad } from "app/map/models/tv-road.model";

export class GeometryNotFound extends Error {

	constructor ( public road: TvRoad, public offset: number, ) {

		super( `GeometryNotFound ${ road.toString() } at offset ${ offset }` );

		Object.setPrototypeOf( this, GeometryNotFound.prototype );

	}

}
