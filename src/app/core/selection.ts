/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject, Transform } from './game-object';
import { EventEmitter } from '@angular/core';

export class ObjectSelection {

    static readonly selectionChange = new EventEmitter<GameObject>();

    private static activeObject: THREE.Object3D;
    private static activeGameObject: GameObject;
    private static activeTransform: Transform;

    static get ActiveObject () {

        return this.activeObject

    };

    static set ActiveObject ( object ) {

        this.activeObject = object
        this.activeTransform.position = object.position;

        this.selectionChange.emit( this.activeGameObject );

    };

    static get ActiveGameObject () {

        return this.activeGameObject;

    }

    static set ActiveGameObject ( gameObject ) {


        this.activeGameObject = gameObject
        this.activeTransform = gameObject.Transform

        this.selectionChange.emit( this.activeGameObject );

    }

    static get ActiveTransform () {

        return this.activeTransform;

    }

    static removeActive (): any {

        this.activeObject = null;
        this.activeGameObject = null;
        this.activeTransform = null;

        this.selectionChange.emit( null );
    }



}