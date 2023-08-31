/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReachPositionCondition } from 'app/modules/scenario/models/conditions/tv-reach-position-condition';
import { ThreeService } from 'app/modules/three-js/three.service';
import { Mesh, MeshBasicMaterial, TorusGeometry } from 'three';
import { Position } from '../../../models/position';
import { EntityCondition } from '../../../models/conditions/entity-condition';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';

@Component( {
	selector: 'app-reach-position-condition',
	templateUrl: './reach-position-condition.component.html',
} )
export class ReachPositionConditionComponent extends BaseConditionEditorComponent implements OnInit, OnDestroy {

	@Input() condition: EntityCondition;

	private sphere: Mesh;

	constructor ( private threeService: ThreeService ) {
		super();
	}

	get reachedCondition () {

		return this.condition as ReachPositionCondition;

	}

	ngOnInit () {

		const geometry = this.getGeometry( this.reachedCondition.tolerance );

		const material = new MeshBasicMaterial( {} );

		this.sphere = new Mesh( geometry, material );

		this.threeService.add( this.sphere );

		this.sphere.position.copy( this.reachedCondition.position.getVectorPosition() );
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

	onPositionTypeChanged ( position: Position ) {

		this.sphere.position.copy( position.getVectorPosition() );

	}

	onPositionChanged ( position: Position ) {

		this.sphere.position.copy( position.getVectorPosition() );

	}

	onToleranceChanged ( value: number ) {

		this.reachedCondition.tolerance = value;

		const geometry = this.getGeometry( value );

		this.sphere.geometry.dispose();

		this.sphere.geometry = geometry;
	}
}
