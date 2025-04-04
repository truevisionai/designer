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

		const position = new Vector3().fromArray( json.position );
		const markingGuid = json.markingGuid;
		const id = json.id;

		const node = new ParkingNode( position, markingGuid );

		node.id = id;

		return node;
	}

	matches ( other: ParkingNode ): boolean {
		return this.id === other.id;
	}

	toSceneJSON (): any {
		return {
			id: this.id,
			position: this.position.toArray(),
			markingGuid: this.markingGuid
		};
	}
}
