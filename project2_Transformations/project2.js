// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	var trans = [ scale*Math.cos(rotation* Math.PI / 180), scale*Math.sin(rotation* Math.PI / 180),0, -scale*Math.sin(rotation* Math.PI / 180), scale*Math.cos(rotation* Math.PI / 180),0,positionX, positionY, 1 ];
	return trans;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	const R = [];  


for (let i = 0; i < 3; i++) {  
    for (let j = 0; j < 3; j++) { 
        let sum = 0;
        for (let m = 0; m < 3; m++) {  
            sum += trans2[i + m * 3] * trans1[m + j * 3];  
        }
        R[j * 3 + i] = sum;
    }
}

    return R;
}
