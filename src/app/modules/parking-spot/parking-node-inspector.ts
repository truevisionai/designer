import { CommandHistory } from "app/commands/command-history";
import { SerializedField, SerializedAction } from "app/core/components/serialization";
import { ParkingGraph } from "app/map/parking/parking-graph";
import { ParkingNode } from "app/map/parking/parking-node";
import { Vector2, Vector3 } from "three";
import { DeleteParkingClusterCommand } from "./commands/delete-parking-cluster-command";
import { DeleteParkingNodeCommand } from "./commands/delete-parking-node-command";

export class ParkingNodeInspector {

	constructor (
		public node: ParkingNode,
		public graph: ParkingGraph
	) {
	}

	@SerializedField( { type: 'vector2' } )
	get position (): Vector2 {
		return new Vector2( this.node.position.x, this.node.position.y );
	}

	set position ( value: Vector2 ) {
		this.node.position.x = value.x;
		this.node.position.y = value.y;
	}

	@SerializedAction( { label: 'Delete Parking Node' } )
	deleteNode (): void {
		CommandHistory.execute( new DeleteParkingNodeCommand( this.graph, this.node ) );
	}

	@SerializedAction( { label: 'Delete Parking Cluster' } )
	deleteCluster (): void {
		CommandHistory.execute( new DeleteParkingClusterCommand( this.graph, this.node ) );
	}

}
