/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Vector3 } from "three";
import { ParkingNode } from "./parking-node";
import { ParkingGraph } from "./parking-graph";

/**
 * Defines the functional type of a parking edge
 */
export enum ParkingEdgeType {
	/** Standard parking stall boundary */
	BOUNDARY = 'boundary',
	/** Entry/exit edge (typically no marking or different marking) */
	ENTRY = 'entry',
	/** Edge adjacent to driving lane */
	LANE_ADJACENT = 'lane_adjacent',
	/** Edge shared between two parking stalls */
	SHARED = 'shared',
	/** Edge along a wall or barrier */
	WALL = 'wall',
	/** Edge along a curb */
	CURB = 'curb',
	/** Custom edge type for special cases */
	CUSTOM = 'custom'
}

/**
 * Visual marking style for an edge
 */
export enum EdgeMarkingStyle {
	/** No visible marking */
	NONE = 'none',
	/** Solid painted line */
	SOLID = 'solid',
	/** Dashed painted line */
	DASHED = 'dashed',
	/** Double solid lines */
	SOLID_SOLID = 'solid_solid',
	// /** Wheel stop/bumper block */
	// WHEEL_STOP = 'wheel_stop',
	// /** Raised curb */
	// RAISED_CURB = 'raised_curb',
	// /** Painted arrow or symbol */
	// SYMBOL = 'symbol',
	// /** Custom marking style */
	// CUSTOM = 'custom'
}

/**
 * Color options for edge markings
 */
export enum EdgeMarkingColor {
	WHITE = 'white',
	YELLOW = 'yellow',
	RED = 'red',
	BLUE = 'blue',
	GREEN = 'green',
	CUSTOM = 'custom'
}

export class ParkingEdge {

	public id: string;

	private type: ParkingEdgeType;

	private markingStyle: EdgeMarkingStyle;

	private markingColor: EdgeMarkingColor;

	constructor (
		private startNode: ParkingNode,
		private endNode: ParkingNode,
		private markingGuid?: string
	) {
		this.id = MathUtils.generateUUID();
	}

	shouldRenderMarking (): boolean {
		return this.markingStyle !== EdgeMarkingStyle.NONE;
	}

	getType (): ParkingEdgeType {
		return this.type;
	}

	setType ( type: ParkingEdgeType ): void {
		this.type = type;
	}

	getMarkingStyle (): EdgeMarkingStyle {
		return this.markingStyle;
	}

	setMarkingStyle ( markingStyle: EdgeMarkingStyle ): void {
		this.markingStyle = markingStyle;
	}

	getMarkingColor (): EdgeMarkingColor {
		return this.markingColor;
	}

	setMarkingColor ( markingColor: EdgeMarkingColor ): void {
		this.markingColor = markingColor;
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

	static fromSceneJSON ( json: any, graph: ParkingGraph ): ParkingEdge {

		const startNode = graph.getNodesById( json.attr_startNodeId );
		const endNode = graph.getNodesById( json.attr_endNodeId );

		const edge = new ParkingEdge( startNode, endNode );

		edge.setType( json.attr_type as ParkingEdgeType );
		edge.setMarkingStyle( json.attr_markingStyle as EdgeMarkingStyle );
		edge.setMarkingColor( json.attr_markingColor as EdgeMarkingColor );
		edge.markingGuid = json.attr_markingGuid;
		edge.id = json.attr_id;

		return edge;
	}

	toSceneJSON (): any {
		return {
			attr_id: this.id,
			attr_startNodeId: this.startNode.id,
			attr_endNodeId: this.endNode.id,
			attr_markingGuid: this.markingGuid,
			attr_type: this.type,
			attr_markingStyle: this.markingStyle,
			attr_markingColor: this.markingColor
		};
	}
}
