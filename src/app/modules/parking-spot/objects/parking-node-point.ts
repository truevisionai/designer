import { SimpleControlPoint } from "../../../objects/simple-control-point";
import { ParkingNode } from "../../../map/parking/parking-node";
import { Vector3 } from "three";

export class ParkingNodePoint extends SimpleControlPoint<ParkingNode> {

	public static readonly TAG = 'ParkingNodePoint';

	constructor ( mainObject: ParkingNode, position?: Vector3 ) {
		super( mainObject, position );
		this.userData.tag = this.tag = ParkingNodePoint.TAG;
	}

}
