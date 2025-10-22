/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ParkingCurve, ParkingSide } from "../../map/parking/parking-curve";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { CommandHistory } from "../../commands/command-history";
import { BakeCurveCommand } from "./commands/bake-curve-command";
import { Commands } from "../../commands/commands";
import { EdgeMarkingColor } from "app/map/parking/parking-edge";
import { ParkingNode } from "app/map/parking/parking-node";
import { Vector3 } from "three";
import { ParkingGraph } from "app/map/parking/parking-graph";
import { DeleteParkingNodeCommand } from "./commands/delete-parking-node-command";

export class ParkingCurveInspector {

	constructor (
		public parkingCurve: ParkingCurve,
		public controlPoint?: AbstractControlPoint
	) {
	}

	@SerializedField( { type: 'float', min: 1 } )
	get width (): number {
		return this.parkingCurve.getWidth();
	}

	set width ( value: number ) {
		this.parkingCurve.setWidth( value );
	}

	@SerializedField( { type: 'float', min: 1 } )
	get length (): number {
		return this.parkingCurve.getLength();
	}

	set length ( value: number ) {
		this.parkingCurve.setLength( value );
	}

	@SerializedField( { type: 'float' } )
	get stallAngle (): number {
		return this.parkingCurve.getAngleDegrees();
	}

	set stallAngle ( value: number ) {
		this.parkingCurve.setAngleDegrees( value );
	}

	@SerializedField( { type: 'enum', enum: ParkingSide } )
	get parkingSide (): ParkingSide {
		return this.parkingCurve.getSide();
	}

	set parkingSide ( value: ParkingSide ) {
		this.parkingCurve.setSide( value );
	}

	@SerializedField( { type: 'enum', enum: EdgeMarkingColor } )
	get color (): EdgeMarkingColor {
		return this.parkingCurve.getColor();
	}

	set color ( value: EdgeMarkingColor ) {
		this.parkingCurve.setColor( value );
	}

	@SerializedAction( { label: 'Bake Parking Curve' } )
	bake (): void {

		CommandHistory.execute( new BakeCurveCommand( this.parkingCurve.getParkingGraph(), this.parkingCurve ) );

	}

	@SerializedAction( { label: 'Delete Parking Curve' } )
	delete (): void {
		Commands.RemoveObject( this.parkingCurve );
	}

	@SerializedAction( {
		label: 'Delete Control Point',
		validate: function () {
			return this.controlPoint !== undefined;
		} // Using the validation method
	} )
	deleteControlPoint (): void {
		Commands.RemoveObject( this.controlPoint );
	}

}


export class ParkingNodeInspector {

	constructor (
		public node: ParkingNode,
		public graph: ParkingGraph,
	) {
	}

	@SerializedField( { type: 'vector3' } )
	get position (): Vector3 {
		return this.node.position;
	}

	set position ( value: Vector3 ) {
		this.node.position.copy( value );
	}

	@SerializedAction( { label: 'Delete Parking Node' } )
	deleteNode (): void {
		CommandHistory.execute( new DeleteParkingNodeCommand( this.graph, this.node ) );
	}

	// @SerializedAction( { label: 'Delete Parking Edges' } )
	// deleteEdges (): void {
	// 	Commands.RemoveObject( this.graph.getEdgesForNode( this.node ) );
	// }

	// @SerializedAction( { label: 'Delete Parking Region' } )
	// deleteRegion (): void {
	// 	Commands.RemoveObject( this.graph.getRegionForNode( this.node ) );
	// }

	// @SerializedAction( { label: 'Delete Parking Regions' } )
	// deleteAllRegions (): void {
	// 	Commands.RemoveObject( this.node );
	// }
}
