/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Vector3 } from "three";

export class ParkingNode {

	public id: string;

	constructor (
		public readonly position?: Vector3,
		private markingGuid?: string
	) {
		this.id = MathUtils.generateUUID();
	}

	static fromSceneJSON ( json: any ): ParkingNode {

		const position = new Vector3(
			parseFloat( json.position.attr_x ) ?? 0,
			parseFloat( json.position.attr_y ) ?? 0,
			parseFloat( json.position.attr_z ) ?? 0
		);

		const markingGuid = json.attr_markingGuid;

		const id = json.attr_id;

		const node = new ParkingNode( position, markingGuid );

		node.id = id;

		return node;
	}

	matches ( other: ParkingNode ): boolean {
		return this.id === other.id;
	}

	toSceneJSON (): any {
		return {
			attr_id: this.id,
			attr_markingGuid: this.markingGuid,
			position: {
				attr_x: this.position?.x,
				attr_y: this.position?.y,
				attr_z: this.position?.z
			},
		};
	}
}
