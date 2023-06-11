import { Component, OnInit, Input } from '@angular/core';
import { OscParameterDeclaration } from '../../models/osc-parameter-declaration';
import { IComponent } from 'app/core/game-object';

@Component( {
    selector: 'app-osc-paramaters-inspector',
    templateUrl: './osc-paramaters-inspector.component.html',
    styleUrls: [ './osc-paramaters-inspector.component.css' ]
} )
export class OscParamatersInspectorComponent implements OnInit, IComponent {

    @Input() declaration: OscParameterDeclaration;

    data: any;

    get parameters () {
        return this.declaration.parameters;
    }

    constructor () {
    }

    ngOnInit () {
        this.declaration = this.data;
    }

}
