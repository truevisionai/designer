/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { INode } from "../../../objects/i-selectable";
import { SelectionStrategy } from "./select-strategy";
import { PointerEventData } from "../../../events/pointer-event-data";

export class NodeStrategy<T extends INode> extends SelectionStrategy<T> {

    private current: T = null;
    private selected: T = null;

    /**
     *
     * @param tag tag of the node to be selected
     * @param returnParent if true, returns the parent of the node, else returns the node itself
     */
    constructor ( private tag: string, private returnParent: boolean = false ) {
        super();
    }

    onPointerDown ( pointerEventData: PointerEventData ): T {

        this.selected?.unselect();

        const node = pointerEventData.intersections.find( i => i.object[ 'tag' ] == this.tag )?.object;

        if ( node && this.returnParent ) {

            this.selected = node.parent as any;

        } else {

            this.selected = node as any;

        }

        this.selected?.select();

        return this.selected;

    }

    onPointerMoved ( pointerEventData: PointerEventData ): T {

        if ( ! this.current?.isSelected ) this.current?.onMouseOut();

        const node = pointerEventData.intersections.find( i => i.object[ 'tag' ] == this.tag )?.object;

        if ( node && this.returnParent ) {

            this.current = node.parent as any;

        } else {

            this.current = node as any;

        }

        if ( ! this.current?.isSelected ) this.current?.onMouseOver();

        return this.current;
    }

    onPointerUp ( pointerEventData: PointerEventData ): T {

        const node = pointerEventData.intersections.find( i => i.object[ 'tag' ] == this.tag )?.object;

        if ( node && this.returnParent ) {

            return node.parent as any;

        } else {

            return node as any;

        }

    }

    dispose (): void {

        // this.current?.onMouseOut();

        // this.selected?.unselect();

    }

}
