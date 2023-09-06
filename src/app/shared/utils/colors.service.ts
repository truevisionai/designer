/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvColors } from "app/modules/tv-map/models/tv-common";

export class COLOR {

	static RED = 0xFF0000;
	static GREEN = 0x00FF00;
	static DARKGREEN = 0x006400;
	static YELLOW = 0xFFFF00;
	static BLUE = 0x0000FF;
	static SKYBLUE = 0x00FFFF;
	static DARKBLUE = 0x00008B;
	static ORANGE = 0xFF4500;
	static GOLD = 0xFFD700;
	static CYAN = 0x00FFFF;

	// New additions
	static BRIGHT_ORANGE = 0xFF7F00; // On-mouse-over color for Control Points
	static DEEP_ORANGE = 0xFF8C00; // On-selected color for Control Points

	static BRIGHT_CYAN = 0x00FFFF; // On-mouse-over color for Splines
	static DEEP_CYAN = 0x00BFBF; // On-selected color for Splines

	static MILD_GREEN = 0x3CB371; // Default color for Lane & Road Reference Lines
	static BRIGHT_GREEN = 0x00FA9A; // On-mouse-over color for Lane & Road Reference Lines
	static DEEP_GREEN = 0x228B22; // On-selected color for Lane & Road Reference Lines

	static BRIGHT_BLUE = 0x6495ED; // On-mouse-over color for Road Node
	static DEEP_BLUE = 0x0000CD; // On-selected color for Road Node

	static DEFAULT_BOX_COLOR = 0xff0000;
	static HIGHTLIGHT_BOX_COLOR = 0x00ff00;
	static CROSSHAIR_COLOR = 0x00ff00;
	static DASHED_LINE_COLOR = 0xff00ff;
	static MAGENTA = 0xFF00FF;
	static BLACK = 0x000000;
	static LIGHTGRAY = 0x666666;
	static GRAY = 0x333333;
	static DARKGRAY = 0x555555;
	static FORESTGREEN = 0x228B22;
	static LIGHTGREEN = 0x008000;
	static WHITE = 0xFFFFFF;

	static fullColorHex ( r: number, g: number, b: number ): string {

		var red = this.rgbToHex( r );
		var green = this.rgbToHex( g );
		var blue = this.rgbToHex( b );

		return red + green + blue;
	}

	static stringToColor ( value: TvColors ): number {

		switch ( value ) {

			case 'standard': return COLOR.WHITE;

			case 'white': return COLOR.WHITE;

			case 'red': return COLOR.RED;

			case 'green': return COLOR.GREEN;

			case 'yellow': return COLOR.YELLOW;

			case 'orange': return COLOR.ORANGE;

			case 'blue': return COLOR.BLUE;

			default: return COLOR.WHITE;

		}

	}

	private static rgbToHex ( rgb ) {

		var hex = Number( rgb ).toString( 16 );

		if ( hex.length < 2 ) hex = '0' + hex;

		return hex;
	}
}
