/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointCloudObject } from "app/assets/point-cloud/point-cloud-object";
import { PointColorMode } from "app/assets/point-cloud/point-cloud-settings";
import { Commands } from "app/commands/commands";
import { SerializedAction, SerializedField } from "app/core/components/serialization";
import { Vector3 } from "three";

export class PointCloudInspector {

	constructor (
		public pointCloud: PointCloudObject
	) {
	}

	applySettings (): void {
		this.pointCloud.applySettings( this.pointCloud.settings );
	}

	@SerializedField( { type: 'vector3', label: 'Position', description: 'The position of the point cloud.' } )
	get position (): Vector3 {
		return this.pointCloud.getPosition()
	}

	set position ( value: Vector3 ) {
		this.pointCloud.setPosition( value );
		this.applySettings();
	}

	@SerializedField( { type: 'float', label: 'Scale', description: 'The scale of the point cloud.' } )
	get scale (): number {
		return this.pointCloud.settings.scale;
	}

	set scale ( value: number ) {
		this.pointCloud.settings.scale = value;
		this.applySettings();
	}

	@SerializedField( { type: 'vector3', label: 'Rotation', description: 'The rotation of the point cloud.' } )
	get rotation (): Vector3 {
		return this.pointCloud.getRotation();
	}

	set rotation ( value: Vector3 ) {
		this.pointCloud.setRotation( value );
		this.applySettings();
	}

	@SerializedField( {
		type: 'float',
		label: 'Opacity',
		description: 'The opacity of the point cloud.',
		min: 0,
		max: 1,
		step: 0.01
	} )
	get opacity (): number {
		return this.pointCloud.getOpacity();
	}

	set opacity ( value: number ) {
		this.pointCloud.setOpacity( value );
		this.applySettings();
	}

	@SerializedField( { type: 'color', label: 'Color' } )
	get color (): any {
		return this.pointCloud.getColor();
	}

	set color ( value: any ) {
		this.pointCloud.setColor( value );
		this.applySettings();
	}

	@SerializedField( {
		type: 'float',
		label: 'Point Size',
		description: 'The size of each point in the point cloud.',
		min: 0.001,
		max: 0.1,
	} )
	get pointSize (): number {
		return this.pointCloud.settings.pointSize;
	}

	set pointSize ( value: number ) {
		this.pointCloud.settings.pointSize = value;
		this.applySettings();
	}

	@SerializedField( {
		type: 'int',
		label: 'Points to Skip',
		description: 'The number of points to skip when processing the point cloud.',
		min: 0,
		max: 10000,
	} )
	get pointsToSkip (): number {
		return this.pointCloud.settings.pointsToSkip;
	}

	set pointsToSkip ( value: number ) {
		this.pointCloud.settings.pointsToSkip = value;
		this.applySettings();
	}

	@SerializedField( { type: 'enum', label: 'Color Mode', enum: PointColorMode, description: 'The color mode of the point cloud.' } )
	get colorMode (): PointColorMode {
		return this.pointCloud.settings.colorMode;
	}

	set colorMode ( value: PointColorMode ) {
		this.pointCloud.settings.colorMode = value;
		this.applySettings();
	}

	@SerializedField( { type: 'boolean', label: 'Use Custom Intensity' } )
	get useCustomIntensity (): boolean {
		return this.pointCloud.settings.useCustomIntensity;
	}

	set useCustomIntensity ( value: boolean ) {
		this.pointCloud.settings.useCustomIntensity = value;
		this.applySettings();
	}

	@SerializedField( { type: 'int', label: 'Intensity Min' } )
	get intensityMin (): number {
		return this.pointCloud.settings.intensityMin;
	}

	set intensityMin ( value: number ) {
		this.pointCloud.settings.intensityMin = value;
		this.applySettings();
	}

	@SerializedField( { type: 'int', label: 'Intensity Max' } )
	get intensityMax (): number {
		return this.pointCloud.settings.intensityMax;
	}

	set intensityMax ( value: number ) {
		this.pointCloud.settings.intensityMax = value;
		this.applySettings();
	}

	@SerializedAction()
	delete (): void {
		Commands.RemoveObject( this.pointCloud );
	}
}
