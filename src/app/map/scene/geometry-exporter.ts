/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from "../models/geometries/tv-abstract-road-geometry";
import { TvGeometryType } from "../models/tv-common";
import { TvArcGeometry } from "../models/geometries/tv-arc-geometry";
import { TvSpiralGeometry } from "../models/geometries/tv-spiral-geometry";
import { TvPoly3Geometry } from "../models/geometries/tv-poly3-geometry";
import { TvParamPoly3Geometry } from "../models/geometries/tv-param-poly3-geometry";
import { Injectable } from "@angular/core";
import { XmlElement } from "app/importers/xml.element";

@Injectable( {
	providedIn: 'root'
} )
export class GeometryExporter {

	export ( geometry: TvAbstractRoadGeometry ): XmlElement {

		switch ( geometry.geometryType ) {

			case TvGeometryType.LINE:
				return this.exportLine( geometry );
			case TvGeometryType.ARC:
				return this.exportArc( geometry as TvArcGeometry );
			case TvGeometryType.SPIRAL:
				return this.exportSpiral( geometry as TvSpiralGeometry );
			case TvGeometryType.POLY3:
				return this.exportPoly3( geometry as TvPoly3Geometry );
			case TvGeometryType.PARAMPOLY3:
				return this.exportParamPoly3( geometry as TvParamPoly3Geometry );
			default:
				throw new Error( `Unknown geometry type:${ geometry.geometryType }` );

		}

	}

	private exportLine ( geometry: TvAbstractRoadGeometry ): XmlElement {

		const xml = this.createBaseXml( geometry );

		xml[ 'line' ] = {}

		return xml;

	}

	private exportArc ( geometry: TvArcGeometry ): XmlElement {

		const xml = this.createBaseXml( geometry );

		xml[ 'arc' ] = {
			attr_curvature: geometry.curvature.toExponential( 16 )
		};

		return xml;

	}

	private exportSpiral ( geometry: TvSpiralGeometry ): XmlElement {

		const xml = this.createBaseXml( geometry );

		xml[ 'spiral' ] = {
			attr_curvStart: geometry.curvStart.toExponential( 16 ),
			attr_curvEnd: geometry.curvEnd.toExponential( 16 )
		};

		return xml;

	}

	private exportPoly3 ( geometry: TvPoly3Geometry ): XmlElement {

		const xml = this.createBaseXml( geometry );

		xml[ 'poly3' ] = {
			attr_a: geometry.attr_a.toExponential( 16 ),
			attr_b: geometry.attr_b.toExponential( 16 ),
			attr_c: geometry.attr_c.toExponential( 16 ),
			attr_d: geometry.attr_d.toExponential( 16 ),
		};

		return xml;

	}

	private exportParamPoly3 ( geometry: TvParamPoly3Geometry ): XmlElement {

		const xml = this.createBaseXml( geometry );

		xml[ 'paramPoly3' ] = {
			attr_pRange: geometry.pRange,
			attr_aU: geometry.aU.toExponential( 16 ),
			attr_bU: geometry.bU.toExponential( 16 ),
			attr_cU: geometry.cU.toExponential( 16 ),
			attr_dU: geometry.dU.toExponential( 16 ),
			attr_aV: geometry.aV.toExponential( 16 ),
			attr_bV: geometry.bV.toExponential( 16 ),
			attr_cV: geometry.cV.toExponential( 16 ),
			attr_dV: geometry.dV.toExponential( 16 ),
		};

		return xml;

	}

	private createBaseXml ( geometry: TvAbstractRoadGeometry ): XmlElement {

		return {
			attr_s: geometry.s.toExponential( 16 ),
			attr_x: geometry.x.toExponential( 16 ),
			attr_y: geometry.y.toExponential( 16 ),
			attr_hdg: geometry.hdg.toExponential( 16 ),
			attr_length: geometry.length.toExponential( 16 ),
		};

	}

}
