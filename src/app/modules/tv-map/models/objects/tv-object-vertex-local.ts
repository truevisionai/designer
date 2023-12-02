import { Vector2, Vector3 } from "three";

export class TvObjectVertexLocal {

	constructor (
		public id: number,
		public uvz: Vector3,
		public dimension?: Vector2,
		public radius?: number,
		public intersectionPoint?: boolean,
	) {
	}

	clone (): TvObjectVertexLocal {

		return new TvObjectVertexLocal(
			this.id,
			this.uvz.clone(),
			this.dimension?.clone(),
			this.radius,
			this.intersectionPoint
		);
	}
}