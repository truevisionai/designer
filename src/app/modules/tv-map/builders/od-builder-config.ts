/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class OdBuilderConfig {

    public static ROAD_STEP = 1.0;

    public static JUNCTION_STEP = 3.0;

    // Junction elevation shift, so that the junction tracks are drawn above the road
    public static JUNCTION_ELEVATION_SHIFT = 0.05;

    // Epsilon constant for length and s related precision
    public static LENGTH_EPS = 0.0000001;

    // Epsilon constant for Height related precision
    public static HEIGHT_EPS = 1.0e-6;

    // Texture scaling along the road (along s)
    // S is divided by this constant to define the number of tiling of the texture
    public static TEXTURE_LENGTH_SCALING = 4.0;

    // widths for the two types of weight values
    public static STD_ROADMARK_WIDTH = 0.15;
    public static BOLD_ROADMARK_WIDTH = 0.3;

    // elevation shift, so that the road mark is drawn above the road
    // 0.001 increases the z-fighting, and requires camera near value of 10
    // 0.01 works well with camera near value of 1
    public static ROADMARK_ELEVATION_SHIFT = 0.01;

    // broken mark tiling
    private static ROADMARK_BROKEN_TILING = 3.0;

}
