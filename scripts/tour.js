function setUpSVG(width, height)
{
    let baseVal = document.getElementById("mySVG").viewBox.baseVal;
    baseVal.width = width;
    baseVal.height = height;
}

function parseStringToTransformInfo2d(str)
{
    // str is of form "matrix(a, b, c, d, tx, ty)"
    // extract a1 etc. to an array of strings with this:
    let strArr = str.substr(7, str.length - 8).split(', ');
    return r = {
        rotMatrix : [[parseFloat(strArr[0]),parseFloat(strArr[1]),0],
                        [parseFloat(strArr[2]),parseFloat(strArr[3]),0],
                        [0,0,1]],
        translation : [parseFloat(strArr[4]),parseFloat(strArr[5]),0],
        scale : 1
    };

}

function parseStringToTransformInfo3d(str)
{
    // str is of form "matrix3d(a1, b1, c1, d1, ..., a4, b4, c4, d4)"
    // extract a1 etc. to an array of strings with this:
    let strArr = str.substr(9, str.length - 10).split(', ');
    const r = {
        rotMatrix : [[0,1,2],
                        [4,5,6],
                        [8,9,10]],
        translation : [12,13,14],
        scale : 15
    };

    for(const row in r.rotMatrix)
    {
        for(const col in r.rotMatrix[row])
        {
            r.rotMatrix[row][col] = parseFloat(strArr[r.rotMatrix[row][col]]);
        }
    }

    for(const id in r.translation)
    {
        r.translation[id] = parseFloat(strArr[r.translation[id]]);
    }

    r.scale = parseFloat(strArr[r.scale]);
    return r;

}

function extractTransformInfo(element)
{
    let matrixString = getComputedStyle(element).transform;
    switch(matrixString.substr(0,7))
    {
        case "none":
            return {
                rotMatrix : [[1,0,0],[0,1,0],[0,0,1]],
                translation : [0,0,0],
                scale : 1
            };
            break;

        case "matrix(":
            return parseStringToTransformInfo2d(matrixString);
            break;

        case "matrix3":
            return parseStringToTransformInfo3d(matrixString);
            break;

        default:
            throw "Error while extracting transform info for element " + element;
    }
}

function applyTransformToVec(vec, transformInfo)
{
    if (vec.length !== transformInfo.rotMatrix.length)
    {
        throw "Vector and matrix column length are not equal, cannot multiply";
    }
    let outVec = [0,0,0];
    for(let row = 0; row < transformInfo.rotMatrix.length; ++row)
    {
        for(let col = 0; col < transformInfo.rotMatrix.length; ++col)
        {
            outVec[row] += vec[col] * transformInfo.rotMatrix[row][col];
        }
        outVec[row] += transformInfo.translation[row];
        outVec[row] = outVec[row] * transformInfo.scale;
    }

    return outVec;
}

function pointOnEllipse(cx, cy, rx, ry, angle)
{
    angle = angle % 360;
    let dx = rx * ry / (Math.sqrt(Math.pow(ry, 2) + Math.pow(rx * Math.tan(angle * Math.PI / 180), 2)));
    let dy = Math.sqrt(1 - Math.pow(dx / rx, 2)) * ry;
    dx = ((-90 < angle) && (angle < 90)) ? dx : -dx;
    dy = (angle < 180) ? dy : -dy;
    return {x : cx + dx, y : cy + dy};
}

function addMask(pathD, maskName)
{
    let newPathElement = document.createElementNS("http://www.w3.org/2000/svg","path");
    newPathElement.setAttribute("d", pathD);
    newPathElement.setAttribute("id", maskName);
    newPathElement.setAttribute("stroke-dasharray",`${newPathElement.getTotalLength()}`);
    document.getElementById("pathMask").appendChild(newPathElement);
    return newPathElement;
}

function addPath(pathD, pathName)
{
    let newPathElement = document.createElementNS("http://www.w3.org/2000/svg","path");
    newPathElement.setAttribute("d", pathD);
    newPathElement.setAttribute("id", pathName);
    newPathElement.setAttribute("mask", "url(#pathMask)");
    newPathElement.style.transition = "opacity 1s";
    document.getElementById("paths").appendChild(newPathElement);
    return newPathElement;
}

function addArea(pathD, areaName)
{
    let newPathElement = document.createElementNS("http://www.w3.org/2000/svg","path");
    newPathElement.setAttribute("d", pathD);
    newPathElement.setAttribute("id", areaName);
    document.getElementById("clickableAreas").appendChild(newPathElement);
    return newPathElement;
}

function enclosurePath(ai)
{
    let P1 = pointOnEllipse(ai.cx, ai.cy, ai.rx, ai.ry, ai.alphaStart);
    let P2 = pointOnEllipse(ai.cx, ai.cy, ai.rx, ai.ry, ai.alphaStart + 270);
    // direction flag
    let f = ai.direction === "anti-clockwise" ? 0 : 1;
    let myPath = `M ${P1.x} ${P1.y} A ${ai.rx} ${ai.ry} 0 ${f} ${f} ${P2.x} ${P2.y} A ${ai.rx} ${ai.ry} 0 ${!f*1} ${f} ${P1.x} ${P1.y}`
    return myPath;
}

function connectionPath(ci)
{
    let startPoint = pointOnEllipse(ci.from.cx, ci.from.cy, ci.from.rx, ci.from.ry, ci.alpha1);
    let endPoint = pointOnEllipse(ci.to.cx, ci.to.cy, ci.to.rx, ci.to.ry, ci.alpha2);
    let x1 = startPoint.x + ci.dx1;
    let y1 = startPoint.y + ci.dy1;
    let x2 = endPoint.x + ci.dx2;
    let y2 = endPoint.y + ci.dy2;
    let myPath = `M ${startPoint.x} ${startPoint.y} C ${x1} ${y1} ${x2} ${y2} ${endPoint.x} ${endPoint.y}`;
    return myPath;
}

function addAreaText(ai, startAlpha, offset)
{
    let rx = ai.rx + offset;
    let ry = ai.ry * rx / ai.rx;
    let P1 = pointOnEllipse(ai.cx, ai.cy, rx, ry, 180);
    let P2 = pointOnEllipse(ai.cx, ai.cy, rx, ry, 0);
    let pathD = `M ${P1.x} ${P1.y} A ${ai.rx} ${ai.ry} 0 1 1 ${P2.x} ${P2.y} A ${ai.rx} ${ai.ry} 0 0 1 ${P1.x} ${P1.y}`
    let pathElement = document.createElementNS("http://www.w3.org/2000/svg","path");
    pathElement.setAttribute("id", `${ai.name}TextPath`);
    pathElement.setAttribute("d", pathD);
    document.getElementById("textPaths").appendChild(pathElement);
    let textElement = document.createElementNS("http://www.w3.org/2000/svg","text");
    textElement.setAttribute("id", `${ai.name}Text`);
    document.getElementById("svgText").appendChild(textElement);
    let textPathElement = document.createElementNS("http://www.w3.org/2000/svg","textPath");
    textPathElement.setAttribute("href", `#${ai.name}TextPath`);
    textPathElement.setAttribute("startOffset", `${startAlpha}%`);
    textPathElement.innerHTML = ai.text;
    textElement.appendChild(textPathElement);
}

function addConnectionText(ci, xOffset, yOffset, startOffset)
{
    let startPoint = pointOnEllipse(ci.from.cx + xOffset, ci.from.cy + yOffset, ci.from.rx, ci.from.ry, ci.alpha1);
    let endPoint = pointOnEllipse(ci.to.cx + xOffset, ci.to.cy + yOffset, ci.to.rx, ci.to.ry, ci.alpha2);
    let x1 = startPoint.x + ci.dx1;
    let y1 = startPoint.y + ci.dy1;
    let x2 = endPoint.x + ci.dx2;
    let y2 = endPoint.y + ci.dy2;
    let pathD = `M ${startPoint.x} ${startPoint.y} C ${x1} ${y1} ${x2} ${y2} ${endPoint.x} ${endPoint.y}`;
    let pathElement = document.createElementNS("http://www.w3.org/2000/svg","path");
    pathElement.setAttribute("id", `${ci.name}TextPath`);
    pathElement.setAttribute("d", pathD);
    document.getElementById("textPaths").appendChild(pathElement);
    let textElement = document.createElementNS("http://www.w3.org/2000/svg","text");
    textElement.setAttribute("id", `${ci.name}Text`);
    document.getElementById("svgText").appendChild(textElement);
    let textPathElement = document.createElementNS("http://www.w3.org/2000/svg","textPath");
    textPathElement.setAttribute("href", `#${ci.name}TextPath`);
    textPathElement.setAttribute("startOffset", `${startOffset}%`);

    textPathElement.innerHTML = ci.text;
    textElement.appendChild(textPathElement);
}

function addCanvasForArea(ai, imgName, width, height)
{
    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", `${ai.name}Canvas`);
    canvas.width = width;
    canvas.height = height;
    
    rx = ai.rx * 0.9;
    ry = ai.ry * 0.9;

    document.getElementById("imgCanvases").appendChild(canvas);
    
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.ellipse(ai.cx, ai.cy,
                rx * 1.0, ry * 1.0,
                0, 0, 2 * Math.PI);
    ctx.fillStyle='black';
    ctx.filter = "blur(10px)";
    ctx.fill();
    ctx.filter = "none";
    ctx.globalCompositeOperation = 'source-in'
    var img = new Image();
    img.src = imgName;
    img.onload=function(){
        let pRatio = this.width / this.height;
        let pWidth = 2 * rx;
        let pHeight = pWidth / pRatio;
        if(pRatio > rx / ry)
        {
            pHeight = 2 * ry;
            pWidth = pHeight * pRatio;
        }
        ctx.drawImage(img, ai.cx - rx, ai.cy - ry, pWidth, pHeight);
        // ctx.globalCompositeOperation = 'source-over'
        // ctx.font = "50px Comic Sans MS, cursive, TSCu_Comic, sans-serif"; 
        // ctx.lineWidth = 5; ctx.lineJoin = "round"; ctx.globalAlpha = 2/3;
        // ctx.strokeStyle = ctx.fillStyle = "#FFFFFF";
        // let textWidth = ctx.measureText(ai.name).width
        // let x = ai.cx - 0.5 * textWidth;
        // let y = ai.cy - ai.ry*1.1;
        // ctx.fillText(ai.name, x, y);
    }

    
    
    return canvas;
}

function testCompleteFunc(timeline)
{
    console.log("dust mask is FINISHED");
    timeline.play()
}

function addToTimeline(timeline, targetName, startPos, endPos, duration, onCompletion, atTime)
{
    let target = document.getElementById(targetName);
    let targetLength = target.getTotalLength();
    timeline.add({
             targets: target,
             strokeDashoffset: [(1-startPos) * targetLength, (1-endPos) * targetLength],
             duration: duration,
             complete: function(anim){
                timeline.pause();
             }
    }, atTime);
}

function processDustClick()
{
    let paths = document.getElementById("paths").children;
    for(let i = 0; i < paths.length; ++i)
    {
        paths[i].style.opacity = "0.5";
    }
    document.getElementById("dustPath").style.opacity = 1.0;
    let infoElement = document.getElementById("infoText");
    infoElement.innerHTML = "";
    let title = document.createElement('div');
    title.innerHTML = "Dust";
    title.style.position = "absolute";
    title.style.left = "5%";
    title.style.top = "5%";
    title.style.fontSize = "150%";
    infoElement.appendChild(title);
    let description = document.createElement('div');
    description.innerHTML = "Dust is made up of SiO² grains";
    description.style.position = "absolute";
    description.style.right = "5%";
    description.style.top = "5%";
    description.style.fontSize = "75%";
    infoElement.appendChild(description);
    let img = document.createElement('img');
    img.style.width = "25%";
    img.style.position = "absolute";
    img.style.right = "5%";
    img.style.bottom = "5%";
    img.src = "./img/dust.jpg";
    infoElement.appendChild(img);
}

function processDustPebblesClick()
{
    let paths = document.getElementById("paths").children;
    for(let i = 0; i < paths.length; ++i)
    {
        paths[i].style.opacity = "0.5";
    }
    document.getElementById("dustPebblesPath").style.opacity = 1.0;
    let infoElement = document.getElementById("infoText");
    infoElement.innerHTML = "";
    let title = document.createElement('div');
    title.innerHTML = "From dust to pebbles";
    title.style.position = "absolute";
    title.style.right = "5%";
    title.style.top = "5%";
    title.style.fontSize = "150%";
    infoElement.appendChild(title);
    let description = document.createElement('div');
    description.innerHTML = "Dust aggregates to pebbles";
    description.style.position = "absolute";
    description.style.right = "5%";
    description.style.top = "60%";
    description.style.fontSize = "75%";
    infoElement.appendChild(description);
    let video = document.createElement('video');
    video.style.width = "20vw";
    video.style.position = "absolute";
    video.style.right = "5%";
    video.style.bottom = "5%";
    video.src = "./img/collision.mp4";
    video.loop = true;
    video.play();
    infoElement.appendChild(video);
}