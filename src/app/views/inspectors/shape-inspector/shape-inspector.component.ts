/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { CurvePath, Mesh, Shape, Vector3 } from 'three';
import { IComponent } from '../../../core/game-object';
import { SceneService } from '../../../services/scene.service';

@Component( {
	selector: 'app-shape-inspector',
	templateUrl: './shape-inspector.component.html',
	styleUrls: [ './shape-inspector.component.css' ]
} )
export class ShapeInspectorComponent implements OnInit, IComponent {

	data: Shape;

	mesh: Mesh;

	_spline: any;

	constructor () {
	}

	get shape () {
		return this.data;
	}

	get randomSpline () {
		if ( this._spline ) return this._spline;
		var randomPoints = [];
		for ( var i = 0; i < 10; i++ ) {
			randomPoints.push( new THREE.Vector3( ( i - 4.5 ) * 50, THREE.MathUtils.randFloat( -50, 50 ), THREE.MathUtils.randFloat( -50, 50 ) ) );
		}
		var randomSpline = this._spline = new THREE.CatmullRomCurve3( randomPoints );
		return randomSpline;
	}

	get geometry () {

		var curePath = new CurvePath<Vector3>();

		curePath.add( this.randomSpline );

		var extrudeSettings = {
			steps: 200,
			bevelEnabled: false,
			extrudePath: curePath
		};

		var geometry = new THREE.ExtrudeGeometry( this.shape, extrudeSettings );

		return geometry;
	}

	ngOnInit () {

		var length = 12, width = 8;

		var shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, width );
		shape.lineTo( length, width );
		shape.lineTo( length, 0 );
		shape.lineTo( 0, 0 );

		this.data = shape;

		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

		this.mesh = new THREE.Mesh( this.geometry, material );

		SceneService.addToMain( this.mesh );
	}

	updateGroupGeometry () {

		this.mesh.geometry.dispose();

		this.mesh.geometry = this.geometry;
	}

	onChange () {

		this.updateGroupGeometry();

	}
}
