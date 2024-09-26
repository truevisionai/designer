import { Injectable } from "@angular/core";
import { PropCurvePoint } from "../objects/prop-curve-point";
import { SimpleControlPointDragHandler } from "app/core/drag-handlers/point-drag-handler.service";

@Injectable()
export class PropCurvePointDragHandler extends SimpleControlPointDragHandler<PropCurvePoint> {

}
