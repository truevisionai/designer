import { Vector3 } from "three";

export class ParkingNode {

	constructor (
		public readonly position: Vector3,
		private markingGuid?: string
	) {
	}

}
