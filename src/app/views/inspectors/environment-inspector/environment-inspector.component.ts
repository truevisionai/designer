import { Component, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { ScenarioEnvironment } from 'app/modules/scenario/models/actions/scenario-environment';

@Component( {
	selector: 'app-environment-inspector',
	templateUrl: './environment-inspector.component.html',
	styleUrls: [ './environment-inspector.component.scss' ]
} )
export class EnvironmentInspectorComponent extends BaseInspector implements IComponent {

	data: ScenarioEnvironment;

	constructor () {
		super()
	}

	ngOnInit () { }

}
