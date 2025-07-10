import { Color, Object3D, Vector3 } from "three";
import { Asset, AssetType } from "../asset.model";
import { Metadata, MetaImporter } from "../metadata.model";

export class PointCloudAssetSettings {
	public translation: Vector3 = new Vector3( 0, 0, 0 );
	public scale: number = 1.0;
	public rotation: Vector3 = new Vector3( 0, 0, 0 );
	public opacity: number = 1.0;
	public color: Color = new Color( 0xffffff );
	public pointSize: number = 0.01;
	public pointsToSkip: number = 0;
}

export class PointCloudAsset extends Asset {

	public readonly object3D: Object3D;

	public settings: PointCloudAssetSettings = new PointCloudAssetSettings();

	constructor ( name: string, path: string, pointCloud: Object3D ) {

		super( AssetType.POINT_CLOUD, name, path );

		this.object3D = pointCloud;

		this.metadata = PointCloudAsset.createMeta( {
			guid: pointCloud.uuid, name, path
		}, this.settings );
	}

	static createMeta ( data: Partial<Asset>, settings: PointCloudAssetSettings ): Metadata {
		return {
			guid: data.guid || undefined,
			path: data.path || undefined,
			isFolder: false,
			importer: MetaImporter.POINT_CLOUD,
			data: settings,
			preview: data.preview || undefined,
		};
	}

}
