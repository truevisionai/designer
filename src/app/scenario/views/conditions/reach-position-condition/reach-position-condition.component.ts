/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReachPositionCondition } from 'app/scenario/models/conditions/tv-reach-position-condition';
import { ThreeService } from 'app/renderer/three.service';
import { Mesh, MeshBasicMaterial, TorusGeometry } from 'three';
import { EntityCondition } from '../../../models/conditions/entity-condition';
import { Position } from '../../../models/position';
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

	ngOnInit (): void {

		const geometry = this.getGeometry( this.reachedCondition.tolerance );

		const material = new MeshBasicMaterial( {} );

		this.sphere = new Mesh( geometry, material );

		this.threeService.add( this.sphere );

		this.sphere.position.copy( this.reachedCondition.position.getVectorPosition() );
	}

	getGeometry ( radius: any ): TorusGeometry {

		const tube = 0.1;
		const radialSegments = 3;
		const tubularSegments = 36;

		return new TorusGeometry( radius, tube, radialSegments, tubularSegments );
	}

	ngOnDestroy (): void {

		this.threeService.remove( this.sphere );

	}

	onPositionTypeChanged ( position: Position ): void {

		this.sphere.position.copy( position.getVectorPosition() );

	}

	onPositionChanged ( position: Position ): void {

		this.sphere.position.copy( position.getVectorPosition() );

	}

	onToleranceChanged ( value: number ): void {

		this.reachedCondition.tolerance = value;

		const geometry = this.getGeometry( value );

		this.sphere.geometry.dispose();

		this.sphere.geometry = geometry;
	}
}
