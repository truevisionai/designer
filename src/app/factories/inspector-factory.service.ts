/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MaterialInspector } from 'app/views/inspectors/material-inspector/material-inspector.component';
import { TextureInspector } from 'app/views/inspectors/texture-inspector/texture-inspector.component';
import { AppInspector } from '../core/inspector';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { AssetInspectorComponent } from 'app/views/inspectors/asset-inspector/asset-inspector.component';

export enum InspectorType {
	prop_model_inspector = 'prop_model_inspector',
	prop_instance_inspector = 'prop_instance_inspector',
}

@Injectable( {
	providedIn: 'root'
} )
export class InspectorFactoryService {

	constructor () {
	}

	setAssetInspector ( asset: AssetNode ) {

		if ( asset.type === AssetType.TEXTURE ) {

			const instance = AssetDatabase.getInstance( asset.metadata.guid );

			AppInspector.setInspector( TextureInspector, {
				texture: instance,
				guid: asset.metadata.guid
			} );

		} else if ( asset.type === AssetType.MATERIAL ) {

			const instance = AssetDatabase.getInstance( asset.metadata.guid );

			AppInspector.setInspector( MaterialInspector, {
				material: instance,
				guid: asset.metadata.guid
			} );

		} else {

			AppInspector.setInspector( AssetInspectorComponent, asset );

		}

	}

}
