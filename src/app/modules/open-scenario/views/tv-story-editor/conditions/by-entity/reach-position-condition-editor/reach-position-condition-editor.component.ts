/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReachPositionCondition } from 'app/modules/open-scenario/models/conditions/tv-reach-position-condition';
import { AbstractPosition } from 'app/modules/open-scenario/models/tv-interfaces';
import { ThreeService } from 'app/modules/three-js/three.service';
import { Mesh, MeshBasicMaterial, TorusGeometry } from 'three';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-reach-position-condition-editor',
	templateUrl: './reach-position-condition-editor.component.html',
} )
export class ReachPositionConditionEditorComponent extends BaseConditionEditorComponent implements OnInit, OnDestroy {

	@Input() condition: ReachPositionCondition;

	private sphere: Mesh;

	constructor ( private threeService: ThreeService ) {
		super();
	}

	ngOnInit () {

		const geometry = this.getGeometry( this.condition.tolerance );

		const material = new MeshBasicMaterial( {} );

		this.sphere = new Mesh( geometry, material );

		this.threeService.add( this.sphere );

		this.sphere.position.copy( this.condition.position.toVector3() );
	}

	getGeometry ( radius ) {

		const tube = 0.1;
		const radialSegments = 3;
		const tubularSegments = 36;

		return new TorusGeometry( radius, tube, radialSegments, tubularSegments );
	}

	ngOnDestroy () {

		this.threeService.remove( this.sphere );

	}

	onPositionTypeChanged ( position: AbstractPosition ) {

		this.sphere.position.copy( position.toVector3() );

	}

	onPositionChanged ( position: AbstractPosition ) {

		this.sphere.position.copy( position.toVector3() );

	}

	onToleranceChanged ( value: number ) {

		this.condition.tolerance = value;

		const geometry = this.getGeometry( value );

		this.sphere.geometry.dispose();

		this.sphere.geometry = geometry;
	}
}
