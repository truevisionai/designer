/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

var SPIRAL = {
	/** S(x) for small x numerator. */
	SN: [
		-2.99181919401019853726E3,
		7.08840045257738576863E5,
		-6.29741486205862506537E7,
		2.54890880573376359104E9,
		-4.42979518059697779103E10,
		3.18016297876567817986E11
	],

	/** S(x) for small x denominator. */
	SD: [
		2.81376268889994315696E2,
		4.55847810806532581675E4,
		5.17343888770096400730E6,
		4.19320245898111231129E8,
		2.24411795645340920940E10,
		6.07366389490084639049E11
	],

	/** C(x) for small x numerator. */
	CN: [
		-4.98843114573573548651E-8,
		9.50428062829859605134E-6,
		-6.45191435683965050962E-4,
		1.88843319396703850064E-2,
		-2.05525900955013891793E-1,
		9.99999999999999998822E-1
	],

	/** C(x) for small x denominator. */
	CD: [
		3.99982968972495980367E-12,
		9.15439215774657478799E-10,
		1.25001862479598821474E-7,
		1.22262789024179030997E-5,
		8.68029542941784300606E-4,
		4.12142090722199792936E-2,
		1.00000000000000000118E0
	],

	/** Auxiliary function f(x) numerator. */
	FN: [
		4.21543555043677546506E-1,
		1.43407919780758885261E-1,
		1.15220955073585758835E-2,
		3.45017939782574027900E-4,
		4.63613749287867322088E-6,
		3.05568983790257605827E-8,
		1.02304514164907233465E-10,
		1.72010743268161828879E-13,
		1.34283276233062758925E-16,
		3.76329711269987889006E-20
	],

	/** Auxiliary function f(x) denominator. */
	FD: [
		7.51586398353378947175E-1,
		1.16888925859191382142E-1,
		6.44051526508858611005E-3,
		1.55934409164153020873E-4,
		1.84627567348930545870E-6,
		1.12699224763999035261E-8,
		3.60140029589371370404E-11,
		5.88754533621578410010E-14,
		4.52001434074129701496E-17,
		1.25443237090011264384E-20
	],

	/** Auxiliary function g(x) numerator. */
	GN: [
		5.04442073643383265887E-1,
		1.97102833525523411709E-1,
		1.87648584092575249293E-2,
		6.84079380915393090172E-4,
		1.15138826111884280931E-5,
		9.82852443688422223854E-8,
		4.45344415861750144738E-10,
		1.08268041139020870318E-12,
		1.37555460633261799868E-15,
		8.36354435630677421531E-19,
		1.86958710162783235106E-22
	],

	/** Auxiliary function g(x) denominator. */
	GD: [
		1.47495759925128324529E0,
		3.37748989120019970451E-1,
		2.53603741420338795122E-2,
		8.14679107184306179049E-4,
		1.27545075667729118702E-5,
		1.04314589657571990585E-7,
		4.60680728146520428211E-10,
		1.10273215066240270757E-12,
		1.38796531259578871258E-15,
		8.39158816283118707363E-19,
		1.86958710162783236342E-22
	],

	/**
	 * Compute a polynomial in x.
	 * @param x double; x
	 * @param coef double[]; coefficients
	 * @return polynomial in x
	 */
	polevl: function ( x, coef ) {
		var result = coef[ 0 ];
		for ( var i = 0; i < coef.length; i++ ) {
			result = result * x + coef[ i ];
		}
		return result;
	},

	/**
	 * Compute a polynomial in x.
	 * @param x double; x
	 * @param coef double[]; coefficients
	 * @return polynomial in x
	 */
	p1evl: function ( x, coef ) {
		var result = x + coef[ 0 ];
		for ( var i = 0; i < coef.length; i++ ) {
			result = result * x + coef[ i ];
		}
		return result;
	},

	/**
	 * Approximate the Fresnel function.
	 * @param xxa double; the xxa parameter
	 * @return double[]; array with two double values c and s
	 */
	fresnel: function ( xxa ) {
		var x = Math.abs( xxa );
		var x2 = x * x;
		var cc, ss;

		if ( x2 < 2.5625 ) {
			var t = x2 * x2;
			ss = x * x2 * this.polevl( t, this.SN ) / this.p1evl( t, this.SD );
			cc = x * this.polevl( t, this.CN ) / this.polevl( t, this.CD );
		} else if ( x > 36974.0 ) {
			cc = 0.5;
			ss = 0.5;
		} else {
			var t = Math.PI * x2;
			var u = 1.0 / ( t * t );
			t = 1.0 / t;
			var f = 1.0 - u * this.polevl( u, this.FN ) / this.p1evl( u, this.FD );
			var g = t * this.polevl( u, this.GN ) / this.p1evl( u, this.GD );

			t = Math.PI * 0.5 * x2;
			var c = Math.cos( t );
			var s = Math.sin( t );
			t = Math.PI * x;
			cc = 0.5 + ( f * s - g * c ) / t;
			ss = 0.5 - ( f * c + g * s ) / t;
		}

		if ( xxa < 0.0 ) {
			cc = -cc;
			ss = -ss;
		}
		return [ cc, ss ];
	},

	/**
	 * Approximate one point of the "standard" spiral (curvature at start is 0).
	 * @param s run-length along spiral
	 * @param cDot first derivative of curvature [1/m2]
	 * @param initialCurvature double; curvature at start
	 * @return double[x,y,t]; array of three double values containing x, y, and tangent direction
	 */
	odrSpiral: function ( s, cDot, initialCurvature ) {
		var a = Math.sqrt( Math.PI / Math.abs( cDot ) );

		var xy = this.fresnel( initialCurvature + s / a );
		return [ xy[ 0 ] * a, xy[ 1 ] * a * Math.sign( cDot ), s * s * cDot * 0.5 ];
	},

	/**
	 * Approximate a clothoid that starts in the x-direction.
	 * @param initialCurvature double; curvature at start
	 * @param curvatureDerivative double; rate of curvature change along the clothoid
	 * @param length double; total length of the clothoid
	 * @param numSegments int; number of segments used to approximate (the number of points is one higher than this)
	 * @return double[[x,y,z]]; the line points array; the z-component of each point is set to 0
	 */
	clothoid_0: function ( initialCurvature, curvatureDerivative, length, numSegments ) {
		var points = new Array( numSegments + 1 );
		// get start tangent
		var offset = this.odrSpiral( initialCurvature / curvatureDerivative, curvatureDerivative, initialCurvature );
		// make it to align with x-axis
		var sinRot = Math.sin( -offset[ 2 ] );
		var cosRot = Math.cos( -offset[ 2 ] );
		for ( var i = 0; i <= numSegments; i++ ) {
			var xyd = this.odrSpiral( i * length / numSegments + initialCurvature / curvatureDerivative, curvatureDerivative, initialCurvature );
			var dx = xyd[ 0 ] - offset[ 0 ];
			var dy = xyd[ 1 ] - offset[ 1 ];
			points[ i ] = [ dx * cosRot - dy * sinRot, dx * sinRot + dy * cosRot, 0 ];
		}
		return points;
	},

	/**
	 * Approximate a clothoid that starts at a given point in the given direction and curvature. Elevation is linearly
	 * interpolated over the length of the clothoid.
	 * @param x1 double; x-coordinate of the start point
	 * @param y1 double; y-coordinate of the start point
	 * @param z1 double; z-component at start of the curve
	 * @param startDirection double; rotation in radians at the start of the curve
	 * @param startCurvature double; curvature at the start of the clothoid
	 * @param endCurvature double; curvature at the end of the clothoid
	 * @param length double; length of the clothoid
	 * @param z2 double; z-component at end of the curve
	 * @param numSegments int; number of segments used to approximate (the number of points is one higher than this)
	 * @return double[[x,y,z]]; the line points array; the clothoid
	 */
	clothoid_1: function ( x1, y1, z1, startDirection, startCurvature, endCurvature, length, z2, numSegments ) {
		var result = this.clothoid_0( startCurvature, ( endCurvature - startCurvature ) / length, length, numSegments );
		var sinRot = Math.sin( startDirection );
		var cosRot = Math.cos( startDirection );
		var list = new Array( result.length );
		var elevationPerStep = ( z2 - z1 ) / ( result.length - 1 );
		for ( var i = 0; i < result.length; i++ ) {
			var p = result[ i ];
			list[ i ] = [ x1 + cosRot * p[ 0 ] - sinRot * p[ 1 ], y1 + sinRot * p[ 0 ] + cosRot * p[ 1 ], z1 + i * elevationPerStep ];
		}
		return list;
	},

	/**
	 * Approximate a clothoid with curvature 0 at start.
	 * @param start double[x,y,z]; starting point of the clothoid
	 * @param startDirection double; start direction of the clothoid
	 * @param endCurvature double; curvature at the end of the clothoid [1/m]
	 * @param length double; length of the clothoid
	 * @param z2 double; elevation at end of the clothoid
	 * @param numSegments int; number of segments used to approximate (the number of points is one higher than this)
	 * @return double[[x,y,z]]; the line points array; the clothoid
	 */
	clothoid_2: function ( start, startDirection, endCurvature, length, z2, numSegments ) {
		return clothoid_1( start[ 0 ], start[ 1 ], start[ 2 ], startDirection, 0, endCurvature, length, z2, numSegments );
	},

	/**
	 * Approximate a clothoid.
	 * @param start double[x,y,z]; starting point of the clothoid
	 * @param startDirection double; start direction of the clothoid
	 * @param startCurvature double; curvature at the start of the clothoid [1/m]
	 * @param endCurvature double; curvature at the end of the clothoid [1/m]
	 * @param length double; length of the clothoid
	 * @param z2 double; elevation at end of the clothoid
	 * @param numSegments int; number of segments used to approximate (the number of points is one higher than this)
	 * @return double[[x,y,z]]; the line points array; the clothoid
	 */
	clothoid_3: function ( start, startDirection, startCurvature, endCurvature, length, z2, numSegments ) {
		return clothoid_1( start[ 0 ], start[ 1 ], start[ 2 ], startDirection, startCurvature, endCurvature, length, z2, numSegments );
	},

	/**
	 * Approximate a clothoid with curvature 0 at start.
	 * @param start double[x,y,z]; starting point of the clothoid
	 * @param startDirection double; start direction of the clothoid
	 * @param endCurvature double; curvature at the end of the clothoid
	 * @param length double; length of the clothoid
	 * @param z2 double; elevation at end of the clothoid
	 * @param numSegments int; number of segments used to approximate (the number of points is one higher than this)
	 * @return double[[x,y,z]]; the line points array; the clothoid
	 */
	clothoid_4: function ( start, startDirection, endCurvature, length, z2, numSegments ) {
		return clothoid_3( start, startDirection, 0, endCurvature, length, z2, numSegments );
	},

	/**
	 * vec2Angle: get direction of vector2d in radians, which is angle between x axis and the vector
	 * @param xy double; vector coordinate, not need to be normalized
	 * @return double; [0,2*PI]
	 */
	vec2Angle: function ( x, y ) {
		var d = Math.sqrt( x * x + y * y );
		x /= d;
		y /= d
		if ( y >= 0 ) return Math.acos( x );
		else return 2 * Math.PI - Math.acos( x );
	},

	/**
	 * guessA:  Find guess for zeros of function g(A)
	 * @param {*} double; phi0
	 * @param {*} double; phi1
	 * @return double;
	 */
	guessA: function ( phi0, phi1 ) {
		var CF = [ 2.989696028701907, 0.716228953608281, -0.458969738821509, -0.502821153340377, 0.261062141752652, -0.045854475238709 ];
		var X = phi0 / Math.PI;
		var Y = phi1 / Math.PI;
		var xy = X * Y;
		return ( phi0 + phi1 ) * ( CF[ 0 ] + xy * ( CF[ 1 ] + xy * CF[ 2 ] ) + ( CF[ 3 ] + xy * CF[ 4 ] ) * ( X * X + Y * Y ) + CF[ 5 ] * ( X * X * X * X + Y * Y * Y * Y ) );
	},

	/**
	 * findA:  Find a zero of function g(A) defined as
	 * g(A) = \int_0^1 \sin( A*t^2+(delta-A)*t+phi0 ) dt
	 * @param {*} double; Aguess
	 * @param {*} double; delta
	 * @param {*} double; phi0
	 * @param {*} double; tol
	 * @return [double,double]
	 */
	findA: function ( Aguess, delta, phi0, tol ) {
		var A = Aguess;
		for ( var iter = 1; iter <= 500; iter++ ) {
			[ intC, intS ] = this.GeneralizedFresnelCS( 3, 2 * A, delta - A, phi0 );
			var f = intS[ 0 ];
			var df = intC[ 2 ] - intC[ 1 ];
			A = A - f / df;
			if ( Math.abs( f ) < tol )
				break;
		}
		if ( Math.abs( f ) > tol * 10 ) {
			console.log( 'Newton iteration fails, f = ', f );
			console.log( 'Aguess = ', Aguess, ', A = ', A, ', delta = ', delta, ', phi0 = ', phi0 );
		}
		return [ A, iter ]
	},
	/**
	 * normalizeAngle:  normalize angle in the range [-pi,pi]
	 * @param {*}double; phi_in
	 * @return double; normalized angle
	 */
	normalizeAngle: function ( phi_in ) {
		var phi = phi_in;
		while ( phi > Math.PI )
			phi = phi - 2 * Math.PI;
		while ( phi < -Math.PI )
			phi = phi + 2 * Math.PI;
		return phi
	},
	/**
	 * buildClothoid:  Compute parameters of the G1 Hermite clothoid fitting
	 *
	 * x0, y0  = coodinate of initial point
	 * theta0  = orientation (angle) of the clothoid at initial point
	 * x1, y1  = coodinate of final point
	 * theta1  = orientation (angle) of the clothoid at final point
	 *
	 * On output:
	 * L  = the lenght of the clothoid curve from initial to final point
	 * k  = curvature at initial point
	 * dk = derivative of curvature respect to arclength, notice that curvature at final point is k+dk*L
	 * iter = Newton Iterations used to solve the interpolation problem
	 */
	buildClothoid: function ( x0, y0, theta0, x1, y1, theta1 ) {
		var dx = x1 - x0;
		var dy = y1 - y0;
		var r = Math.sqrt( dx * dx + dy * dy );
		var phi = Math.atan2( dy, dx );

		var phi0 = this.normalizeAngle( theta0 - phi );
		var phi1 = this.normalizeAngle( theta1 - phi );
		var delta = phi1 - phi0;

		// initial point
		var Aguess = this.guessA( phi0, phi1 );

		// Newton iteration
		[ A, iter ] = this.findA( Aguess, delta, phi0, 1e-12 );

		// final operation
		[ h, g ] = this.GeneralizedFresnelCS( 1, 2 * A, delta - A, phi0 );
		var L = r / h;

		if ( L > 0 ) {
			var k = ( delta - A ) / L;
			var dk = 2 * A / ( L * L );
		} else {
			console.error( 'negative length' );
		}


		return [ k, dk, L, iter ]
	},

	/**
	 *
	 * @param {*} int; nk
	 * @param {*} double; a
	 * @param {*} double; b
	 * @param {*} double; c
	 */
	GeneralizedFresnelCS: function ( nk, a, b, c ) {
		var epsi = 1e-3; // best thresold
		if ( Math.abs( a ) < epsi ) // case `a` small
			[ X, Y ] = this.evalXYaSmall( nk, a, b, 3 );
		else
			[ X, Y ] = this.evalXYaLarge( nk, a, b );
		var cc = Math.cos( c );
		var ss = Math.sin( c );
		for ( var k = 0; k < nk; k++ ) {
			var xx = X[ k ];
			var yy = Y[ k ];
			X[ k ] = xx * cc - yy * ss;
			Y[ k ] = xx * ss + yy * cc;
		}
		return [ X, Y ]
	},

	FresnelCSk: function ( nk, t ) {
		var C = new Array( nk );
		var S = new Array( nk );
		[ C[ 0 ], S[ 0 ] ] = this.FresnelCS( t );
		if ( nk > 1 ) {
			var tt = Math.PI / 2 * t * t;
			var ss = Math.sin( tt );
			var cc = Math.cos( tt );
			C[ 1 ] = ss / Math.PI;
			S[ 1 ] = ( 1 - cc ) / Math.PI;
			if ( nk > 2 ) {
				C[ 2 ] = ( t * ss - S[ 0 ] ) / Math.PI;
				S[ 2 ] = ( C[ 0 ] - t * cc ) / Math.PI;
			}
		}
		return [ C, S ]
	},
	evalXYaLarge: function ( nk, a, b ) {
		var X = new Array( nk );
		var Y = new Array( nk );
		var s = Math.sign( a );
		var z = Math.sqrt( Math.abs( a ) / Math.PI );
		var ell = s * b / Math.sqrt( Math.abs( a ) * Math.PI );
		var g = -0.5 * s * b * b / Math.abs( a );
		[ Cl, Sl ] = this.FresnelCSk( nk, ell );
		[ Cz, Sz ] = this.FresnelCSk( nk, ell + z );
		var dC = new Array( Cz.length ); /*= Cz - Cl;*/
		for ( var i = 0; i < dC.length; i++ ) dC[ i ] = Cz[ i ] - Cl[ i ];
		var dS = new Array( Sz.length ); /*= Sz - Sl;*/
		for ( var i = 0; i < dS.length; i++ ) dS[ i ] = Sz[ i ] - Sl[ i ];
		var cg = Math.cos( g ) / z;
		var sg = Math.sin( g ) / z;
		X[ 0 ] = cg * dC[ 0 ] - s * sg * dS[ 0 ];
		Y[ 0 ] = sg * dC[ 0 ] + s * cg * dS[ 0 ];
		if ( nk > 1 ) {
			cg = cg / z;
			sg = sg / z;
			DC = dC[ 1 ] - ell * dC[ 0 ];
			DS = dS[ 1 ] - ell * dS[ 0 ];
			X[ 1 ] = cg * DC - s * sg * DS;
			Y[ 1 ] = sg * DC + s * cg * DS;
			if ( nk > 2 ) {
				cg = cg / z;
				sg = sg / z;
				DC = dC[ 2 ] + ell * ( ell * dC[ 0 ] - 2 * dC[ 1 ] );
				DS = dS[ 2 ] + ell * ( ell * dS[ 0 ] - 2 * dS[ 1 ] );
				X[ 2 ] = cg * DC - s * sg * DS;
				Y[ 2 ] = sg * DC + s * cg * DS;
			}
		}
		return [ X, Y ];
	},

	rLommel: function ( mu, nu, b ) {
		var tmp = 1 / ( ( mu + nu + 1 ) * ( mu - nu + 1 ) );
		var res = tmp;
		for ( var n = 0; n < 100; n++ ) {
			tmp = tmp * ( -b / ( 2 * n + mu - nu + 1 ) ) * ( b / ( 2 * n + mu + nu + 1 ) );
			res = res + tmp;
			if ( Math.abs( tmp ) < Math.abs( res ) * 1e-50 )
				break;
		}
		return res;
	},
	evalXYazero: function ( nk, b ) {
		var X = new Array( nk );
		var Y = new Array( nk );
		var sb = Math.sin( b );
		var cb = Math.cos( b );
		var b2 = b * b;
		if ( Math.abs( b ) < 1e-3 ) {
			X[ 0 ] = 1 - ( b2 / 6 ) * ( 1 - ( b2 / 20 ) * ( 1 - ( b2 / 42 ) ) );
			Y[ 0 ] = ( b / 2 ) * ( 1 - ( b2 / 12 ) * ( 1 - ( b2 / 30 ) ) );
		} else {
			X[ 0 ] = sb / b;
			Y[ 0 ] = ( 1 - cb ) / b;
		}
		// use recurrence in the stable part
		var m = Math.min( Math.max( 1, Math.floor( 2 * b ) ), nk );
		for ( var k = 1; k <= m - 1; k++ ) {
			X[ k ] = ( sb - k * Y[ k - 1 ] ) / b;
			Y[ k ] = ( k * X[ k - 1 ] - cb ) / b;
		}
		// use Lommel for the unstable part
		if ( m < nk ) {
			var A = b * sb;
			var D = sb - b * cb;
			var B = b * D;
			var C = -b2 * sb;
			var rLa = this.rLommel( m + 1 / 2, 3 / 2, b );
			var rLd = this.rLommel( m + 1 / 2, 1 / 2, b );
			for ( var k = m; k <= nk - 1; k++ ) {
				var rLb = this.rLommel( k + 3 / 2, 1 / 2, b );
				var rLc = this.rLommel( k + 3 / 2, 3 / 2, b );
				X[ k ] = ( k * A * rLa + B * rLb + cb ) / ( 1 + k );
				Y[ k ] = ( C * rLc + sb ) / ( 2 + k ) + D * rLd;
				rLa = rLc;
				rLd = rLb;
			}
		}
		return [ X, Y ];
	},
	evalXYaSmall: function ( nk, a, b, p ) {
		[ X0, Y0 ] = this.evalXYazero( nk + 4 * p + 2, b );

		var X = new Array( nk );
		var Y = new Array( nk );
		var tmpX = new Array( p + 1 );
		var tmpY = new Array( p + 1 );
		var sum = function ( arr ) {
			var sumation = 0.0;
			for ( var i = 0; i < arr.length; i++ )
				sumation += arr[ i ]
			return sumation;
		}

		for ( var j = 1; j <= nk; j++ ) {
			tmpX[ 0 ] = X0[ j - 1 ] - ( a / 2 ) * Y0[ j + 1 ];
			tmpY[ 0 ] = Y0[ j - 1 ] + ( a / 2 ) * X0[ j + 1 ];
			var t = 1;
			var aa = -( a / 2 ) * ( a / 2 );
			for ( var n = 1; n <= p; n++ ) {
				var ii = 4 * n + j;
				t = t * ( aa / ( 2 * n * ( 2 * n - 1 ) ) );
				var bf = a / ( 4 * n + 2 );
				tmpX[ n ] = t * ( X0[ ii - 1 ] - bf * Y0[ ii + 1 ] );
				tmpY[ n ] = t * ( Y0[ ii - 1 ] + bf * X0[ ii + 1 ] );
			}
			X[ j - 1 ] = sum( tmpX );
			Y[ j - 1 ] = sum( tmpY );
		}
		return [ X, Y ];
	},

	FresnelCS: function ( y ) {
		var fn = [ 0.49999988085884732562,
			1.3511177791210715095,
			1.3175407836168659241,
			1.1861149300293854992,
			0.7709627298888346769,
			0.4173874338787963957,
			0.19044202705272903923,
			0.06655998896627697537,
			0.022789258616785717418,
			0.0040116689358507943804,
			0.0012192036851249883877 ];

		var fd = [ 1.0,
			2.7022305772400260215,
			4.2059268151438492767,
			4.5221882840107715516,
			3.7240352281630359588,
			2.4589286254678152943,
			1.3125491629443702962,
			0.5997685720120932908,
			0.20907680750378849485,
			0.07159621634657901433,
			0.012602969513793714191,
			0.0038302423512931250065 ];

		var gn = [ 0.50000014392706344801,
			0.032346434925349128728,
			0.17619325157863254363,
			0.038606273170706486252,
			0.023693692309257725361,
			0.007092018516845033662,
			0.0012492123212412087428,
			0.00044023040894778468486,
			-8.80266827476172521e-6,
			-1.4033554916580018648e-8,
			2.3509221782155474353e-10 ];

		var gd = [ 1.0,
			2.0646987497019598937,
			2.9109311766948031235,
			2.6561936751333032911,
			2.0195563983177268073,
			1.1167891129189363902,
			0.57267874755973172715,
			0.19408481169593070798,
			0.07634808341431248904,
			0.011573247407207865977,
			0.0044099273693067311209,
			-0.00009070958410429993314 ];

		var FresnelC = 0;
		var FresnelS = 0;

		var eps = 1e-7;

		var x = Math.abs( y );
		if ( x < 1.0 ) {
			var t = -( ( Math.PI / 2 ) * x * x ) * ( ( Math.PI / 2 ) * x * x );
			// Cosine integral series
			var twofn = 0.0;
			var fact = 1.0;
			var denterm = 1.0;
			var numterm = 1.0;
			var sum = 1.0;
			var ratio = 10.0;

			while ( ratio > eps ) {
				twofn = twofn + 2.0;
				fact = fact * twofn * ( twofn - 1.0 );
				denterm = denterm + 4.0;
				numterm = numterm * t;
				term = numterm / ( fact * denterm );
				sum = sum + term;
				ratio = Math.abs( term / sum );
			}

			FresnelC = x * sum;

			// Sine integral series
			twofn = 1.0;
			fact = 1.0;
			denterm = 3.0;
			numterm = 1.0;
			sum = 1.0 / 3.0;
			ratio = 10.0;

			while ( ratio > eps ) {
				twofn = twofn + 2.0;
				fact = fact * twofn * ( twofn - 1.0 );
				denterm = denterm + 4.0;
				numterm = numterm * t;
				term = numterm / ( fact * denterm );
				sum = sum + term;
				ratio = Math.abs( term / sum );
			}

			FresnelS = ( Math.PI / 2 ) * sum * x * x * x;
		} else if ( x < 6.0 ) {
			// Rational approximation for f
			var sumn = 0.0;
			var sumd = fd[ 11 ];
			for ( var k = 10; k >= 0; k-- ) {
				sumn = fn[ k ] + x * sumn;
				sumd = fd[ k ] + x * sumd;
			}
			var f = sumn / sumd;
			// Rational approximation for  g
			sumn = 0.0;
			sumd = gd[ 11 ];
			for ( var k = 10; k >= 0; k-- ) {
				sumn = gn[ k ] + x * sumn;
				sumd = gd[ k ] + x * sumd;
			}
			var g = sumn / sumd;
			var U = ( Math.PI / 2 ) * x * x;
			var SinU = Math.sin( U );
			var CosU = Math.cos( U );
			FresnelC = 0.5 + f * SinU - g * CosU;
			FresnelS = 0.5 - f * CosU - g * SinU;
		} else {
			// x >= 6; asymptotic expansions for  f  and  g
			t = -Math.pow( Math.PI * x * x, -2.0 );
			// Expansion for  f
			var numterm = -1.0;
			var term = 1.0;
			var sum = 1.0;
			var oldterm = 1.0;
			var ratio = 10.0;
			var eps10 = 0.1 * eps;

			while ( ratio > eps10 ) {
				numterm = numterm + 4.0;
				term = term * numterm * ( numterm - 2.0 ) * t;
				sum = sum + term;
				absterm = Math.abs( term );
				ratio = Math.abs( term / sum );
				if ( oldterm < absterm ) {
					console.log( '\n\n !!In FresnelCS f not converged to eps' );
					ratio = eps10;
				}
				oldterm = absterm;
			}

			var f = sum / ( Math.PI * x );
			// Expansion for  g
			numterm = -1.0;
			term = 1.0;
			sum = 1.0;
			oldterm = 1.0;
			ratio = 10.0;
			eps10 = 0.1 * eps;

			while ( ratio > eps10 ) {
				numterm = numterm + 4.0;
				term = term * numterm * ( numterm + 2.0 ) * t;
				sum = sum + term;
				absterm = Math.abs( term );
				ratio = Math.abs( term / sum );
				if ( oldterm < absterm ) {
					console.log( '\n\n!!In FresnelCS g not converged to eps' );
					ratio = eps10;
				}
				oldterm = absterm;
			}
			var g = sum / ( ( Math.PI * x ) * ( Math.PI * x ) * x );
			var U = ( Math.PI / 2 ) * x * x;
			var SinU = Math.sin( U );
			var CosU = Math.cos( U );
			FresnelC = 0.5 + f * SinU - g * CosU;
			FresnelS = 0.5 - f * CosU - g * SinU;
		}
		if ( y < 0 ) {
			FresnelC = -FresnelC;
			FresnelS = -FresnelS;
		}
		return [ FresnelC, FresnelS ];
	}
}

module.exports = SPIRAL
