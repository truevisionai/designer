import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BaseConditionEditorComponent } from '../base-condition-editor-component';
import { OscReachPositionCondition } from 'app/modules/open-scenario/models/conditions/osc-reach-position-condition';
import { ThreeService } from 'app/modules/three-js/three.service';
import { MeshBasicMaterial, Mesh, TorusGeometry } from 'three';
import { AbstractPosition } from 'app/modules/open-scenario/models/osc-interfaces';

@Component( {
	selector: 'app-reach-position-condition-editor',
	templateUrl: './reach-position-condition-editor.component.html',
} )
export class ReachPositionConditionEditorComponent extends BaseConditionEditorComponent implements OnInit, OnDestroy {

	@Input() condition: OscReachPositionCondition;

	private sphere: Mesh;

	constructor ( private threeService: ThreeService ) {
		super();
	}

	ngOnInit () {

		const geometry = this.getGeometry( this.condition.tolerance );

		const material = new MeshBasicMaterial( {} );

		this.sphere = new Mesh( geometry, material );

		this.threeService.add( this.sphere );

		this.sphere.position.copy( this.condition.position.getPosition() );
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

		this.sphere.position.copy( position.getPosition() );

	}

	onPositionChanged ( position: AbstractPosition ) {

		this.sphere.position.copy( position.getPosition() );

	}

	onToleranceChanged ( value: number ) {

		this.condition.tolerance = value;

		const geometry = this.getGeometry( value );

		this.sphere.geometry.dispose();

		this.sphere.geometry = geometry;
	}
}
