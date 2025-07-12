import * as THREE from "three";
import { Points, PointsMaterial } from "three";
import { PointCloudSettings } from "./point-cloud-settings";

export class PointCloudObject extends Points<THREE.BufferGeometry, PointsMaterial> {

	public settings = new PointCloudSettings();

	public assetGuid: string;

	constructor ( assetGuid: string, geometry: THREE.BufferGeometry, material: PointsMaterial ) {
		super( geometry, material );
		this.name = 'PointCloudObject';
		this.assetGuid = assetGuid || THREE.MathUtils.generateUUID();
	}

	get isPointCloudObject (): boolean {
		return true;
	}

	setSettings ( settings: PointCloudSettings ): void {
		this.settings = settings;
	}

	applySettings ( settings: PointCloudSettings ): void {

		this.position.copy( settings.position );
		this.scale.setScalar( settings.scale );

		this.rotation.set(
			THREE.MathUtils.degToRad( settings.rotation.x ),
			THREE.MathUtils.degToRad( settings.rotation.y ),
			THREE.MathUtils.degToRad( settings.rotation.z )
		);

		this.material.size = settings.pointSize;
		this.material.opacity = settings.opacity;
		this.material.transparent = settings.opacity < 1;
		this.material.vertexColors = true;

		// apply color to points
		if ( settings.color ) {
			this.material.color = settings.color;
		}

		// apply points to skip
		if ( settings.pointsToSkip > 0 ) {
			this.geometry.setDrawRange( 0, this.geometry.attributes.position.count - settings.pointsToSkip );
		}
	}

	toSceneJSON (): any {
		return {
			attr_assetGuid: this.assetGuid,
			attr_name: this.name,
			settings: this.settings.toSceneJSON()
		};
	}

	static fromPoints ( points: Points, assetGuid: string ): PointCloudObject {
		return new PointCloudObject( assetGuid, points.geometry, points.material as PointsMaterial );
	}

}

export function isPointCloudObject ( object: any ): object is PointCloudObject {
	return object && object.isPointCloudObject;
}
