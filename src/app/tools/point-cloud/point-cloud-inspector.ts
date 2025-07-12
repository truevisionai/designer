// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

import { PointCloudObject } from "app/assets/point-cloud/point-cloud-object";
import { PointCloudSettings } from "app/assets/point-cloud/point-cloud-settings";
import { SerializedField } from "app/core/components/serialization";
import { Vector3 } from "three";

// import { TvLane } from "../../map/models/tv-lane";
// import { LaneService } from "../../services/lane/lane.service";
// import { SerializedAction, SerializedField } from "../../core/components/serialization";
// import { TravelDirection, TvLaneType } from "../../map/models/tv-common";
// import { Commands } from "../../commands/commands";
// import { LaneFactory } from "app/services/lane/lane.factory";

// export class LaneInspector {

// 	constructor (
// 		public lane: TvLane,
// 		public laneService: LaneService
// 	) {
// 	}

// 	@SerializedField( { label: 'Lane Id', type: 'int', disabled: true } )
// 	get laneId (): number {
// 		return Number( this.lane.id );
// 	}

// 	set laneId ( value: number ) {
// 		this.lane.id = value;
// 	}

// 	@SerializedField( { type: 'enum', enum: TvLaneType } )
// 	get type (): TvLaneType {
// 		return this.lane.type;
// 	}

// 	set type ( value: TvLaneType ) {
// 		this.laneService.setLaneType( this.lane, value );
// 	}

// 	@SerializedField( { type: 'boolean' } )
// 	get level (): boolean {
// 		return this.lane.level;
// 	}

// 	set level ( value ) {
// 		this.lane.level = value;
// 	}

// 	@SerializedField( { type: 'enum', enum: TravelDirection } )
// 	get direction () {
// 		return this.lane.direction;
// 	}

// 	set direction ( value: TravelDirection ) {
// 		this.lane.direction = value;
// 	}

// 	@SerializedAction()
// 	duplicate (): void {

// 		const duplicate = LaneFactory.createDuplicate( this.lane );

// 		Commands.AddObject( duplicate );

// 	}

// 	@SerializedAction()
// 	delete (): void {

// 		Commands.RemoveObject( this.lane );

// 	}

// }


export class PointCloudInspector {

	constructor (
		public pointCloud: PointCloudObject
	) {
	}

	applySettings (): void {
		this.pointCloud.applySettings( this.pointCloud.settings );
	}

	// now for each field in settings, we create a getter and setter

	@SerializedField( { type: 'vector3', label: 'Position' } )
	get position (): Vector3 {
		return this.pointCloud.settings.position;
	}

	set position ( value: Vector3 ) {
		this.pointCloud.settings.position = value;
		this.applySettings();
	}

	@SerializedField( { type: 'float', label: 'Scale' } )
	get scale (): number {
		return this.pointCloud.settings.scale;
	}

	set scale ( value: number ) {
		this.pointCloud.settings.scale = value;
		this.applySettings();
	}

	@SerializedField( { type: 'vector3', label: 'Rotation' } )
	get rotation (): Vector3 {
		return this.pointCloud.settings.rotation;
	}

	set rotation ( value: Vector3 ) {
		this.pointCloud.settings.rotation = value;
		this.applySettings();
	}

	@SerializedField( { type: 'float', label: 'Opacity' } )
	get opacity (): number {
		return this.pointCloud.settings.opacity;
	}

	set opacity ( value: number ) {
		this.pointCloud.settings.opacity = value;
		this.applySettings();
	}

	@SerializedField( { type: 'color', label: 'Color' } )
	get color (): any {
		return this.pointCloud.settings.color;
	}

	set color ( value: any ) {
		this.pointCloud.settings.color = value;
		this.applySettings();
	}

	@SerializedField( { type: 'float', label: 'Point Size' } )
	get pointSize (): number {
		return this.pointCloud.settings.pointSize;
	}

	set pointSize ( value: number ) {
		this.pointCloud.settings.pointSize = value;
		this.applySettings();
	}

	@SerializedField( { type: 'int', label: 'Points to Skip' } )
	get pointsToSkip (): number {
		return this.pointCloud.settings.pointsToSkip;
	}

	set pointsToSkip ( value: number ) {
		this.pointCloud.settings.pointsToSkip = value;
		this.applySettings();
	}

}
