/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Output } from '@angular/core';

export class EditorEvents {

    @Output() static onZoomIn = new EventEmitter<any>();
    @Output() static onZoomOut = new EventEmitter<any>();
    @Output() static onZoomReset = new EventEmitter<any>();

    @Output() static sceneRendered = new EventEmitter<number>();
    @Output() static sceneCreated = new EventEmitter<null>();

}
