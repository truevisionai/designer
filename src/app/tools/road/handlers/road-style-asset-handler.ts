import { AssetDatabase } from "app/assets/asset-database";
import { Asset, AssetType } from "app/assets/asset.model";
import { RoadStyle } from "app/assets/road-style/road-style.model";
import { Commands } from "app/commands/commands";
import { RoadService } from "app/services/road/road.service";
import { AssetDropHandler } from "app/tools/asset-drop-handler";
import { Vector3 } from "three";

export class RoadStyleAssetDropHandler implements AssetDropHandler {

	isAssetSupported ( asset: Asset ): boolean {

		return asset.type === AssetType.ROAD_STYLE;

	}

	handle ( asset: Asset, position: Vector3 ): void {

		const road = RoadService.instance.findNearestRoad( position );

		if ( !road ) {
			console.warn( 'Road not found' );
			return;
		}

		const roadStyle = AssetDatabase.getInstance<RoadStyle>( asset.guid );

		if ( !roadStyle ) {
			console.warn( 'Road style not found' );
			return;
		}

		const oldValue = road.roadStyle.clone( null );

		const newValue = roadStyle.clone( null );

		Commands.SetValue( road, 'roadStyle', newValue, oldValue );

	}

}
