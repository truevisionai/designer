/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Color, Group, LineSegments, LineBasicMaterial } from 'three';
import { COLOR } from 'app/shared/utils/colors.service';

export class RoadNode extends Group {

    public static readonly tag = 'road-node';
    public static readonly lineTag = 'road-node-line';

    public static defaultColor = COLOR.MAGENTA;
    public static defaultOpacity = 0.35;
    public static defaultWidth = 5;

    public line: LineSegments;
    public isSelected = false;

    constructor ( public roadId: number, public distance: 'start' | 'end', public s?: number ) {

        super();

    }

    get material () { return this.line.material as LineBasicMaterial; }

    selected () {

        this.isSelected = true;

        this.material.color = new Color( COLOR.RED );

        this.renderOrder = 5;
    }

    unselected () {

        this.isSelected = false;

        this.material.color = new Color( RoadNode.defaultColor );

        this.renderOrder = 3;
    }
}
