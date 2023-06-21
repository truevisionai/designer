import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { OpenScenario } from 'app/modules/scenario/models/tv-scenario';

@Component( {
	selector: 'app-xosc-file-inspector',
	templateUrl: './xosc-file-inspector.component.html',
	styleUrls: [ './xosc-file-inspector.component.scss' ]
} )
export class XoscFileInspectorComponent implements OnInit, IComponent {

	data: OpenScenario;

	constructor () { }

	ngOnInit () { }

}
