/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

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

    private static rgbToHex ( rgb ) {

        var hex = Number( rgb ).toString( 16 );

        if ( hex.length < 2 ) hex = "0" + hex;

        return hex;
    }

    static fullColorHex ( r: number, g: number, b: number ): string {

        var red = this.rgbToHex( r );
        var green = this.rgbToHex( g );
        var blue = this.rgbToHex( b );

        return red + green + blue;
    }
}
