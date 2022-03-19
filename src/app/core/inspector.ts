/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Type } from '@angular/core';
import { ComponentItem, IComponent } from './game-object';

export class AppInspector {

    public static inspectorChanged = new EventEmitter<ComponentItem>();
    public static inspectorCleared = new EventEmitter<ComponentItem>();

    /**
     * fired when new instance of inspector is created 
     */
    public static inspectorCreated = new EventEmitter<IComponent>();

    private static componentItem: ComponentItem;

    public static currentInspector: Type<IComponent>;
    public static currentInspectorData: any;

    public static setInspector ( component: Type<IComponent>, data: any ) {

        if ( !component ) this.clear();

        if ( !component ) return;

        this.currentInspector = component;

        this.currentInspectorData = data;

        this.componentItem = new ComponentItem( component, data );

        this.inspectorChanged.emit( this.componentItem );

    }

    public static getInspector (): ComponentItem {

        return this.componentItem;

    }

    static clear () {

        this.currentInspector = null;

        this.currentInspectorData = null;

        this.inspectorCleared.emit( null );

    }

}
