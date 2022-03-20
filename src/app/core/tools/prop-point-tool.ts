/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { PointEditor } from '../editors/point-editor';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { Subscription } from 'rxjs';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { SnackBar } from 'app/services/snack-bar.service';
import { AppInspector } from '../inspector';
import { PropInstance } from '../models/prop-instance.model';
import { InspectorFactoryService, InspectorType } from '../factories/inspector-factory.service';
import { ProjectBrowserService } from 'app/views/editor/project-browser/project-browser.service';
import { ModelImporterService } from 'app/services/model-importer.service';
import { PropService } from 'app/services/prop-service';
import { AssetDatabase } from 'app/services/asset-database';

/**
 * Prop point tool
 * 
 * Steps
 * 1. Select a prop (fbx, gltf) from library browser
 * 2. SHIFT + LEFT-CLICK to drop it in the scene
 * 
 * Requires an instance of prop to be able to drop them in the scene
 * 
 * 
 */
export class PropPointTool extends BaseTool {

    public name: string = 'PropPointTool';

    public shapeEditor: PointEditor;

    private cpSubscriptions: Subscription[] = [];

    private controlPointAddedSubscriber: Subscription;
    private controlPointSelectedSubscriber: Subscription;
    private controlPointUnselectedSubscriber: Subscription;

    constructor ( private modelImporter?: ModelImporterService ) {

        super();

    }

    get prop (): PropInstance {

        const prop = PropService.getProp();

        if ( prop ) {

            return new PropInstance( prop.guid, AssetDatabase.getInstance( prop.guid ) );

        }

    }

    init () {

        super.init();

        this.shapeEditor = new PointEditor( 100 );

    }

    enable () {

        super.enable();

        this.map.props.forEach( ( prop: PropInstance ) => {

            const cp = this.shapeEditor.addControlPoint( prop.object.position );

            this.sync( cp, prop );

        } );

        this.controlPointAddedSubscriber = this.shapeEditor.controlPointAdded.subscribe(

            point => this.onControlPointAdded( point )

        );

        this.controlPointSelectedSubscriber = this.shapeEditor.controlPointSelected.subscribe(

            point => this.onControlPointSelected( point )

        );

        this.controlPointUnselectedSubscriber = this.shapeEditor.controlPointUnselected.subscribe(

            point => this.onControlPointUnselected( point )

        );

    }

    disable (): void {

        super.disable();

        this.controlPointAddedSubscriber.unsubscribe();
        this.controlPointSelectedSubscriber.unsubscribe();
        this.controlPointUnselectedSubscriber.unsubscribe();

        this.shapeEditor.destroy();

        this.unsubscribeFromControlPoints();
    }

    private onControlPointSelected ( point: AnyControlPoint ) {

        InspectorFactoryService.setByType( InspectorType.prop_instance_inspector, point.mainObject );

    }

    private onControlPointUnselected ( point: AnyControlPoint ) {

        AppInspector.clear();

    }

    private onControlPointAdded ( point: AnyControlPoint ) {

        if ( !this.prop ) SnackBar.error( "Select a prop from the project browser" );

        if ( !this.prop ) this.shapeEditor.removeControlPoint( point );

        if ( !this.prop ) return;

        const prop = new PropInstance( this.prop.guid, this.prop.object.clone() );

        prop.object.position.set( point.position.x, point.position.y, point.position.z );

        this.sync( point, prop );

        this.map.gameObject.add( prop.object );

        TvMapQueries.map.props.push( prop );

    }

    private sync ( point: AnyControlPoint, prop: PropInstance ): void {

        const subscription = point.updated.subscribe( e => {

            prop.object.position.copy( e.position );

        } );

        point.mainObject = prop;

        this.cpSubscriptions.push( subscription );
    }

    private unsubscribeFromControlPoints () {

        this.cpSubscriptions.forEach( sub => {

            sub.unsubscribe();

        } );

    }

}