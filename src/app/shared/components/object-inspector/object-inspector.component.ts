/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { ComponentContainerDirective } from '../../directives/component-container.directive';
import { ComponentItem, IComponent } from '../../../core/game-object';
import { AppInspector } from '../../../core/inspector';

@Component( {
    selector: 'app-object-inspector',
    templateUrl: './object-inspector.component.html',
    styleUrls: [ './object-inspector.component.css' ]
} )
export class ObjectInspectorComponent implements OnInit {

    @ViewChild( ComponentContainerDirective ) componentContainer: ComponentContainerDirective;

    constructor (
        private componentFactoryResolver: ComponentFactoryResolver,
    ) {

        AppInspector.inspectorChanged.subscribe( ( e: ComponentItem ) => {
            this.loadInspector( e );
        } );

        AppInspector.inspectorCleared.subscribe( () => {
            this.clearInspector();
        } )
    }

    loadInspector ( component: ComponentItem ) {

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory( component.component );

        const viewContainerRef = this.componentContainer.viewContainerRef;

        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent( componentFactory );

        const componentInstance = componentRef.instance as IComponent;

        componentInstance.data = component.data;

        AppInspector.inspectorCreated.emit( componentInstance );
    }

    clearInspector () {

        this.componentContainer.viewContainerRef.clear();

    }


    ngOnInit () {


    }

}
