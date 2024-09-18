import { TvAbstractRoadGeometry } from "../models/geometries/tv-abstract-road-geometry";
import { XmlElement } from "../../importers/xml.element";
import { TvGeometryType } from "../models/tv-common";
import { TvArcGeometry } from "../models/geometries/tv-arc-geometry";
import { TvSpiralGeometry } from "../models/geometries/tv-spiral-geometry";
import { TvPoly3Geometry } from "../models/geometries/tv-poly3-geometry";
import { TvParamPoly3Geometry } from "../models/geometries/tv-param-poly3-geometry";
import { Injectable } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class GeometryExporter {

	export ( geometry: TvAbstractRoadGeometry ) {

		const xml: XmlElement = {
			attr_s: geometry.s.toExponential( 16 ),
			attr_x: geometry.x.toExponential( 16 ),
			attr_y: geometry.y.toExponential( 16 ),
			attr_hdg: geometry.hdg.toExponential( 16 ),
			attr_length: geometry.length.toExponential( 16 ),
		};

		switch ( geometry.geometryType ) {

			case TvGeometryType.LINE:

				xml[ 'line' ] = null;

				break;

			case TvGeometryType.ARC:

				const arc = geometry as TvArcGeometry;

				xml[ 'arc' ] = {};
				xml[ 'arc' ][ 'attr_curvature' ] = arc.curvature;

				break;

			case TvGeometryType.SPIRAL:

				const sprial = geometry as TvSpiralGeometry;

				xml[ 'spiral' ] = {};
				xml[ 'spiral' ][ 'attr_curvStart' ] = sprial.curvStart;
				xml[ 'spiral' ][ 'attr_curvEnd' ] = sprial.curvEnd;

				break;

			case TvGeometryType.POLY3:

				const poly3 = geometry as TvPoly3Geometry;

				xml[ 'poly3' ] = {};
				xml[ 'poly3' ][ 'attr_a' ] = poly3.attr_a;
				xml[ 'poly3' ][ 'attr_b' ] = poly3.attr_b;
				xml[ 'poly3' ][ 'attr_c' ] = poly3.attr_c;
				xml[ 'poly3' ][ 'attr_d' ] = poly3.attr_d;

				break;

			case TvGeometryType.PARAMPOLY3:

				const paramPoly3 = geometry as TvParamPoly3Geometry;

				xml[ 'paramPoly3' ] = {};

				xml[ 'paramPoly3' ][ 'attr_pRange' ] = paramPoly3.pRange;

				xml[ 'paramPoly3' ][ 'attr_aU' ] = paramPoly3.aU;
				xml[ 'paramPoly3' ][ 'attr_bU' ] = paramPoly3.bU;
				xml[ 'paramPoly3' ][ 'attr_cU' ] = paramPoly3.cU;
				xml[ 'paramPoly3' ][ 'attr_dU' ] = paramPoly3.dU;

				xml[ 'paramPoly3' ][ 'attr_aV' ] = paramPoly3.aV;
				xml[ 'paramPoly3' ][ 'attr_bV' ] = paramPoly3.bV;
				xml[ 'paramPoly3' ][ 'attr_cV' ] = paramPoly3.cV;
				xml[ 'paramPoly3' ][ 'attr_dV' ] = paramPoly3.dV;

				break;
		}

		return xml;

	}

}
