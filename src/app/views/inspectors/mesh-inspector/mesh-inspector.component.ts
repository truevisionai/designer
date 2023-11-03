/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { TvMesh } from 'app/modules/three-js/objects/TvMesh';

@Component( {
	selector: 'app-mesh-inspector',
	templateUrl: './mesh-inspector.component.html',
	styleUrls: [ './mesh-inspector.component.scss' ]
} )
export class MeshInspectorComponent implements OnInit {

	@Input() mesh: TvMesh;

	constructor () {
	}

	get materials (): string[] {

		if ( this.mesh?.materialGuid instanceof Array ) {

			return this.mesh?.materialGuid;

		} else {

			return [ this.mesh?.materialGuid ];
		}
	}

	ngOnInit () {

		console.log( this.mesh.material );
		console.log( this.mesh.materialGuid );

	}

	onMaterialChanged ( $event, $guid ) {


	}
}
