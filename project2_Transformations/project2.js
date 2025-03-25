// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	const trans = [ Math.cos(rotation), -Math.sin(rotation), positionX, Math.cos(rotation), Math.sin(rotation), positionY, 0, 0, scale ]
	 
	return trans;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	const trans = []
	const transp = [trans2[0],trans2[3],trans2[6],trans2[1],trans2[4],trans2[7],trans2[2],trans2[5],trans2[8]]
	for(let i = 0; i < 9; i++){
		trans[i] = trans1[i] * transp[i]
	}
	
	return trans;
}