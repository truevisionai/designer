import { Component, OnDestroy, OnInit } from '@angular/core';
import { Asset } from 'app/assets/asset.model';
import { AssetService } from 'app/assets/asset.service';
import { DynamicMeta } from 'app/assets/metadata.model';
import { PointCloudAsset, PointCloudAssetSettings } from 'app/assets/point-cloud/point-cloud-asset';
import { TvTexture } from 'app/assets/texture/tv-texture.model';
import { Commands } from 'app/commands/commands';
import { IComponent } from 'app/objects/game-object';

@Component( {
	selector: 'app-point-cloud-inspector',
	templateUrl: './point-cloud-inspector.component.html',
	styleUrls: [ './point-cloud-inspector.component.scss' ],
} )
export class PointCloudInspectorComponent implements OnInit, IComponent, OnDestroy {

	data: Asset;

	settings: PointCloudAssetSettings;

	constructor ( private assetService: AssetService ) { }

	ngOnInit (): void {

		this.settings = this.data.metadata.data as PointCloudAssetSettings;

	}

	ngOnDestroy (): void {

		this.save();

	}

	save (): void {

		if ( !this.data ) return;

		this.assetService.updateMetaFile( this.data.path, this.data.metadata );

	}

	update (): void {

		console.log( this.settings );

	}

	onChange ( $newValue: any, property: keyof PointCloudAssetSettings ): void {

		if ( !this.settings ) return;

		Commands.SetValue( this.settings, property, $newValue );

		this.save();

	}

}
