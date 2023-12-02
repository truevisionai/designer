import { TvObjectVertexLocal } from "./tv-object-vertex-local";
import { TvObjectVertexRoad } from "./tv-object-vertex-road";

export type TvObjectVertex = TvObjectVertexLocal | TvObjectVertexRoad;

export class TvObjectPolyline {

	constructor (
		public id: number,
		public vertices: TvObjectVertex[] = [],
	) {
	}

	clone (): TvObjectPolyline {

		return new TvObjectPolyline(
			this.id,
			this.vertices.map( vertex => vertex.clone() )
		);

	}

}
