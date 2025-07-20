import { Asset, AssetType } from "../asset.model";
import { Metadata, MetaImporter } from "../metadata.model";
import { PointCloudObject } from "./point-cloud-object";

export class PointCloudAsset extends Asset {

	public object3D: PointCloudObject;

	constructor ( name: string, path: string, guid: string ) {
		super( AssetType.POINT_CLOUD, name, path );
		this.metadata = PointCloudAsset.createMeta( { name, path, guid } );
	}

	setObject3D ( object: PointCloudObject ): void {
		this.object3D = object;
	}

	static createMeta ( data: Partial<Asset> ): Metadata {
		return {
			guid: data.guid || undefined,
			path: data.path || undefined,
			isFolder: false,
			importer: MetaImporter.POINT_CLOUD,
			data: undefined,
			preview: data.preview || undefined,
		};
	}

}
