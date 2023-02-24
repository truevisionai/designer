/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { Subscription } from 'rxjs';
import { PointEditor } from '../editors/point-editor';
import { KeyboardInput } from '../input';
import { CatmullRomSpline } from '../shapes/catmull-rom-spline';
import { BaseTool } from './base-tool';

export class SurfaceTool extends BaseTool {

    public name: string = 'SurfaceTool';

    public shapeEditor: PointEditor;

    private cpSubscriptions: Subscription[] = [];

    private cpAddedSub: Subscription;
    private cpMovedSub: Subscription;
    private cpUpdatedSub: Subscription;
    private cpSelectedSub: Subscription;
    private cpUnselectedSub: Subscription;
    private keyDownSub: Subscription;

    private surface: TvSurface;

    constructor () {

        super();

    }

    public init () {

        super.init();

        this.shapeEditor = new PointEditor( 100 );
    }

    public enable () {

        super.enable();

        this.map.surfaces.forEach( surface => {

            surface.update();

            surface.showControlPoints();

            surface.showCurve();

            surface.spline.controlPoints.forEach( cp => {

                cp.mainObject = surface;

                this.shapeEditor.controlPoints.push( cp );

            } );
        } );

        this.keyDownSub = KeyboardInput.keyDown
            .subscribe( e => this.onDeletePressed( e ) );

        this.cpAddedSub = this.shapeEditor.controlPointAdded
            .subscribe( ( cp: AnyControlPoint ) => this.onControlPointAdded( cp ) );

        this.cpMovedSub = this.shapeEditor.controlPointMoved
            .subscribe( () => this.onControlPointMoved() );

        this.cpUpdatedSub = this.shapeEditor.controlPointUpdated
            .subscribe( () => this.onControlPointUpdated() );

        this.cpSelectedSub = this.shapeEditor.controlPointSelected
            .subscribe( ( cp: AnyControlPoint ) => this.onControlPointSelected( cp ) );

        this.cpUnselectedSub = this.shapeEditor.controlPointUnselected
            .subscribe( () => this.onControlPointUnselected() );

    }

    public disable (): void {

        super.disable();

        this.map.surfaces.forEach( surface => {

            surface.hideCurve();
            surface.hideControlPoints();

        } );

        this.keyDownSub.unsubscribe();
        this.cpAddedSub.unsubscribe();
        this.cpMovedSub.unsubscribe();
        this.cpUpdatedSub.unsubscribe();
        this.cpSelectedSub.unsubscribe();
        this.cpUnselectedSub.unsubscribe();

        this.shapeEditor.destroy();
    }

    public onPointerClicked ( e: PointerEventData ) {

        for ( let i = 0; i < e.intersections.length; i++ ) {

            const intersection = e.intersections[ i ];

            if ( intersection.object && intersection.object[ 'tag' ] === TvSurface.tag ) {

                this.surface = intersection.object.userData.surface;

                this.surface.showControlPoints();

                break;
            }
        }
    }

    private onControlPointSelected ( cp: AnyControlPoint ) {

        this.surface = cp.mainObject;

        this.surface.showControlPoints();

    }

    private onControlPointUnselected () {

        this.surface = null;

    }

    private onControlPointAdded ( cp: AnyControlPoint ) {

        if ( !this.surface ) {

            this.surface = new TvSurface( 'grass', new CatmullRomSpline() );

            this.map.surfaces.push( this.surface );

        }

        cp.mainObject = this.surface;

        this.surface.spline.addControlPoint( cp );

        this.surface.update();

    }

    private onControlPointUpdated () {

        this.surface.spline.update();

        this.surface.update();

    }

    private onControlPointMoved () {

        this.surface.spline.update();

    }

    private onDeletePressed ( e: KeyboardEvent ) {

        if ( e.key === 'Delete' && this.surface ) {

            this.surface.delete();

            const index = this.map.surfaces.findIndex( s => s.id == this.surface.id );

            if ( index > -1 ) {

                this.map.surfaces.splice( index, 1 );

            }

            this.surface = null;

            delete this.surface;
        }

    }

}
