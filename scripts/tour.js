function myMain(){
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    let r = document.querySelector(':root');

    let ellipseCircumference = document.getElementById("displayPath0").getTotalLength();
    let dashLength = ellipseCircumference / 32;
    r.style.setProperty('--dashLength', `${dashLength}`)

    var img=new Image();
    img.src="img/exoplanets-disks.jpg";
    img.onload=function(){
        ctx.drawImage(this,0,0);
        var titleImg = new Image();
        titleImg.src = "./img/Title.png";
        titleImg.onload=function(){
            ctx.drawImage(titleImg, 250, 25, 1250, 1250*titleImg.height/titleImg.width);
        }
        addCanvasForArea("dust", "./img/IDP_with_text.jpg", this.width, this.height);
        addCanvasForArea("pebbles", "./img/Pebble_Labor_2.jpg", this.width, this.height);
        addCanvasForArea("planetesimal", "./img/arrokoth_cut.png", this.width, this.height);
        addCanvasForArea("dustToPebble", "./img/transition_0.png", this.width, this.height);
        addCanvasForArea("pebblesToPlanetesimal", "./img/transition_1.png", this.width, this.height);
        
        let areas = document.querySelectorAll("#displayPaths > g")
        
        for(let item in areas)
        {
            if(areas[item].id != undefined)
            {
                let areaName = areas[item].id.replace("Area", '');
                let itemPopup = document.getElementById(`${areaName}Popup`);
                let itemBackground = document.getElementById(`${areaName}Background`);

                areas[item].addEventListener("click", function(){
                    itemPopup.style.opacity = 1.0;
                    itemPopup.style.pointerEvents = "all";
                    itemBackground.style.pointerEvents = "all";
                });

                itemBackground.addEventListener("click", function(){
                    itemPopup.style.opacity = 0;
                    itemPopup.style.pointerEvents = "none";
                    itemBackground.style.pointerEvents = "none";
                });
            }
        }

        // let areaName = "comet";
        // let itemPopup = document.getElementById(`${areaName}Popup`);
        // let itemBackground = document.getElementById(`${areaName}Background`);
        // itemPopup.style.opacity = 1.0;
        // itemPopup.style.pointerEvents = "all";
        // itemBackground.style.pointerEvents = "all";
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