/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

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
		return this.startNode.matches( startNode ) && this.endNode.matches( endNode );
	}

	getNodePositions (): Vector3[] {
		return [ this.startNode.position, this.endNode.position ];
	}

	toSceneJSON (): any {
		return {
			attr_id: this.id,
			attr_startNodeId: this.startNode.id,
			attr_endNodeId: this.endNode.id,
			attr_markingGuid: this.markingGuid
		};
	}
}
