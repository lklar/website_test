import anime from './anime.es.js';

function myMain(){
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    let r = document.querySelector(':root');
    
    let pathSpeed = 2000;
    let maskSpeed = 2000;
    let fadeInSpeed = 1000;

    let ellipseCircumference = document.getElementById("displayPath0").getTotalLength();
    let dashLength = ellipseCircumference / 32;
    r.style.setProperty('--dashLength', `${dashLength}`)

    let strokeDashoffsets = [0, 0.65, 0.65, 0.65, 0.65, 0.40, 0.40, 0.30, 1.70, 1.70, 1.3, 0.65];
    let pathLengths = [];
    for(let i = 0; i < 12; ++i)
    {
        anime({
            targets : `#displayPath${i}`,
            strokeDashoffset : [(2.0 + strokeDashoffsets[i]) * dashLength, strokeDashoffsets[i] * dashLength],
            easing : 'linear',
            duration : pathSpeed,
            loop : true
        });
        let displayPath = document.getElementById(`displayPath${i}`);
        let mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
        mask.setAttribute("id", `mask${i}`);
        let maskPath = document.createElementNS("http://www.w3.org/2000/svg","path");
        maskPath.setAttribute("id", `mask${i}Path`);
        maskPath.setAttribute("d", displayPath.getAttribute("d"));
        document.getElementById("pathMasks").appendChild(mask);
        mask.appendChild(maskPath);

        let maskLength = maskPath.getTotalLength();
        displayPath.setAttribute("mask", `url(#mask${i})`);
        maskPath.setAttribute("stroke-dasharray", `${maskLength}`);
        maskPath.setAttribute("stroke-dashoffset", `${maskLength}`);
        pathLengths.push(maskLength);
    }
    
    

    var img=new Image();
    img.src="img/exoplanets-disks.jpg";
    img.onload=function(){
        ctx.drawImage(this,0,0);
        addCanvasForArea("dust", "./img/IDP.jpg", this.width, this.height);
        addCanvasForArea("pebbles", "./img/Pebble_Labor_2.jpg", this.width, this.height);
        addCanvasForArea("planetesimal", "./img/arrokoth_cut.png", this.width, this.height);
        addCanvasForArea("transition0", "./img/transition_0.png", this.width, this.height);
        addCanvasForArea("transition1", "./img/transition_1.png", this.width, this.height);
        
        maskSpeed /= pathLengths[0];
        let tl = anime.timeline({
        easing: 'linear'
        });
        tl.pause();
        tl.add({
            // Fade in dust image + enclosure
            targets : ['#displayPath0', '#dustCanvas'],
            opacity : [0, 1],
            duration : fadeInSpeed,
            complete : function(anim){
                document.getElementById("dustArea").style.pointerEvents = "all";
                document.getElementById("displayPath0").removeAttribute("mask");
            }
        }).add({
            // Draw path to transitional area 0
            targets : '#mask1Path',
            strokeDashoffset : [pathLengths[1], 0],
            duration : pathLengths[1] * maskSpeed,
            complete : function(anim){
                document.getElementById("displayPath1").removeAttribute("mask");
            }
        }).add({
            // Draw transitional area 0 enclosure
            targets : ['#mask2Path', '#mask3Path'],
            strokeDashoffset : [pathLengths[2], 0],
            duration : pathLengths[2] * maskSpeed,
            complete : function(anim){
                document.getElementById("displayPath2").removeAttribute("mask");
                document.getElementById("displayPath3").removeAttribute("mask");
            }
        }).add({
            // Fade in transitional area 0 content
            targets : ['#transition0Canvas'],
            opacity : [0, 1],
            duration : fadeInSpeed
        }).add({
            // Draw path to pebbles area
            targets : '#mask4Path',
            strokeDashoffset : [pathLengths[4], 0],
            duration : pathLengths[4] * maskSpeed,
            complete : function(anim){
                document.getElementById("displayPath4").removeAttribute("mask");
            }
        }).add({
            // Draw pebbles area
            targets : ['#mask5Path', '#mask6Path'],
            strokeDashoffset : [pathLengths[5], 0],
            duration : pathLengths[5] * maskSpeed,
            complete : function(anim){
                document.getElementById("pebblesArea").style.pointerEvents = "all";
                document.getElementById("displayPath5").removeAttribute("mask");
                document.getElementById("displayPath6").removeAttribute("mask");
            }
        }).add({
            // Fade in pebbles area content
            targets : ['#pebblesCanvas'],
            opacity : [0, 1],
            duration : fadeInSpeed
        }).add({
            // Draw path to transitional area 1
            targets : '#mask7Path',
            strokeDashoffset : [pathLengths[7], 0],
            duration : pathLengths[7] * maskSpeed,
            complete : function(anim){
                document.getElementById("displayPath7").removeAttribute("mask");
            }
        }).add({
            // Draw transitional area 1
            targets : ['#mask8Path', '#mask9Path'],
            strokeDashoffset : [pathLengths[8], 0],
            duration : pathLengths[8] * maskSpeed,
            complete : function(anim){
                document.getElementById("displayPath8").removeAttribute("mask");
                document.getElementById("displayPath9").removeAttribute("mask");
            }
        }).add({
            // Fade in transitional area 1 content
            targets : ['#transition1Canvas'],
            opacity : [0, 1],
            duration : fadeInSpeed
        }).add({
            // Draw path to planetesimal area
            targets : '#mask10Path',
            strokeDashoffset : [pathLengths[10], 0],
            duration : pathLengths[10] * maskSpeed,
            complete : function(anim){
                document.getElementById("displayPath10").removeAttribute("mask");
            }
        }).add({
            // Draw planetesimal area
            targets : '#mask11Path',
            strokeDashoffset : [pathLengths[11], 0],
            duration : pathLengths[11] * maskSpeed,
            complete : function(anim){
                document.getElementById("displayPath11").removeAttribute("mask");
            }
        }).add({
            // Fade in planetesimal area content
            targets : ['#planetesimalCanvas'],
            opacity : [0, 1],
            duration : fadeInSpeed,
            complete : function(anim){
                document.getElementById("planetesimalArea").style.pointerEvents = "all";
                document.getElementById("displayPath0").removeAttribute("mask");
            }
        });
        document.getElementById("mask0Path").setAttribute("stroke-dashoffset", "0");
        tl.play();

        let clickables = {
            dust : {
                area : document.getElementById("dustArea"),
                popup : document.getElementById("dustPopup"),
                background : document.getElementById("dustBackground")
            },
            pebbles : {
                area : document.getElementById("pebblesArea"),
                popup : document.getElementById("pebblesPopup"),
                background : document.getElementById("pebblesBackground")
            },
            planetesimal : {
                area : document.getElementById("planetesimalArea"),
                popup : document.getElementById("planetesimalPopup"),
                background : document.getElementById("planetesimalBackground")
            }
        }
        for(let key in clickables)
        {
            clickables[key].area.addEventListener("click", function(){
                clickables[key].popup.style.opacity = 1.0;
                clickables[key].popup.style.pointerEvents = "all";
                clickables[key].background.style.pointerEvents = "all";
            });
            clickables[key].background.addEventListener("click", function(){
                clickables[key].popup.style.opacity = 0;
                clickables[key].popup.style.pointerEvents = "none";
                clickables[key].background.style.pointerEvents = "none";
            });
        }
    }
}

function addCanvasForArea(areaName, imgName, canvasWidth, canvasHeight)
{
    let combinedPath = "";
    let myArea = document.getElementById(`${areaName}Area`);
    for(let child of myArea.children)
    {
        combinedPath += child.getAttribute("d");
    }
    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", `${areaName}Canvas`);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style["opacity"] = "1.0";

    document.getElementById("imgCanvases").appendChild(canvas);
    let ctx = canvas.getContext("2d");
    let p = new Path2D(combinedPath);
    ctx.fillStyle='black';
    ctx.filter = "blur(5px)";
    ctx.fill(p);
    ctx.filter = "none";
    ctx.globalCompositeOperation = 'source-in'
    var img = new Image();
    img.src = imgName;
    img.onload=function(){
        let bBox = myArea.getBBox();
        let pRatio = this.width / this.height;
        if(pRatio > bBox.width / bBox.height)
            ctx.drawImage(img, bBox.x, bBox.y, bBox.height * pRatio, bBox.height);
        else
            ctx.drawImage(img, bBox.x, bBox.y, bBox.width, bBox.width / pRatio);
    }
    return canvas;
}

export default myMain;