import { MathUtils, Vector3 } from "three";
import { ParkingNode } from "./parking-node";

export class ParkingEdge {

	public id: string;

	constructor (
		private startNode: ParkingNode,
		private endNode: ParkingNode,
		private markingGuid?: string
	) {
		this.id = MathUtils.generateUUID();
	}

	getStartNode (): ParkingNode {
		return this.startNode;
	}

	getEndNode (): ParkingNode {
		return this.endNode;
	}

	getMarkingGuid (): string {
		return this.markingGuid;
	}

	matches ( startNode: ParkingNode, endNode: ParkingNode ): boolean {
		return this.startNode === startNode && this.endNode === endNode;
	}

	fromSceneJSON ( json: any ): ParkingEdge {

		const startNode = ParkingNode.fromSceneJSON( json.startNode );
		const endNode = ParkingNode.fromSceneJSON( json.endNode );
		const markingGuid = json.markingGuid;
		const id = json.id;

		const edge = new ParkingEdge( startNode, endNode, markingGuid );

		edge.id = id;

		return edge;
	}

	getNodePositions (): Vector3[] {

		return [ this.startNode.position, this.endNode.position ];

	}

	toSceneJSON (): any {
		return {
			id: this.id,
			startNodeId: this.startNode.id,
			endNodeId: this.endNode.id,
			markingGuid: this.markingGuid
		};
	}
}
