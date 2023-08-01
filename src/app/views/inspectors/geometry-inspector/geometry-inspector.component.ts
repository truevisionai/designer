/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AssetDatabase } from 'app/services/asset-database';
import { COLOR } from 'app/shared/utils/colors.service';
import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D } from 'three';

@Component( {
	selector: 'app-geometry-inspector',
	templateUrl: './geometry-inspector.component.html',
	styleUrls: [ './geometry-inspector.component.scss' ]
} )
export class GeometryInspectorComponent implements OnInit, IComponent, OnDestroy {

	data: BufferGeometry;

	model: Mesh;

	constructor () { }

	ngOnDestroy (): void {

	}

	ngOnInit () {

		this.model = new Mesh( this.data, new MeshBasicMaterial( { color: COLOR.MAGENTA } ) )

		console.log( this.data.scale );

	}

	onScaleChanged ( $scale: number ) {

		if ( $scale == undefined ) return;
		if ( $scale <= 0 ) return;

		this.model.scale.setScalar( $scale );

		this.data.scale( $scale, $scale, $scale );

		const meta = AssetDatabase.getMetadata( this.data.uuid );

		const instance = AssetDatabase.getInstance( this.data.uuid );


		if ( meta ) {
			console.log( meta );
		} else {
			console.log( 'no meta', this.data.uuid );
		}

		if ( instance ) {
			console.log( instance );
		} else {
			console.log( 'no instance', this.data.uuid );
		}
	}

}
