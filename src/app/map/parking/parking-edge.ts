import { ParkingNode } from "./parking-node";

export class ParkingEdge {

	constructor (
		public readonly startNode: ParkingNode,
		public readonly endNode: ParkingNode,
		private markingGuid?: string
	) {
	}

}
