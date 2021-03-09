
$(document).on('click', '.routeDirections', function(e) {

    let myOverlay = document.createElement("div");
    myOverlay.id = 'overlay';

    myOverlay.style.position = 'absolute';
    myOverlay.style.top = 0
    myOverlay.style.backgroundColor = 'rgba(247,247,247,0.7)';
    myOverlay.style.cursor = 'pointer';

    //resize and poition overlay
    myOverlay.style.width = window.innerWidth + 'px';
    myOverlay.style.height = window.innerHeight + 'px';
    myOverlay.style.top = window.pageYOffset+ 'px';
    myOverlay.style.left = window.pageXOffset + 'px';
    myOverlay.style.zIndex = '9998';
    document.body.appendChild(myOverlay);
    

    let $id = e.target.id;
    let $routeDirectionsArray = [];
    //console.log($id);
    //console.log(document.getElementById($id));
    //console.log(document.getElementById($id).getAttribute('data-value'));
    
    let $paper = document.createElement("div");

    if(document.getElementById($id) !== null ) {

        let $str = document.getElementById($id).getAttribute('data-value');

        //commented lines below are required if I use font awesome <i> tag in creation of marker icon with this class (.routeDirections)

        //let $str = document.getElementById($id).outerHTML;
        //let $index = $str.indexOf('data-value=');
        //let $end = $str.indexOf('"><i');
        //$str = $str.substring($index, $end);
        //$str = $str.substring(12);

        $routeDirectionsArray = $str.split(',');

    } else {
        //alert("No outerHTML: "+$id);
        $sign = document.createElement('p');
        $signText = document.createTextNode('Something went wrong. Please close this page and re-open.');
        $sign.appendChild($signText);
        $paper.appendChild($sign);
    }

    //let $paper = document.createElement("div");
    $paper.style.height = '80vh';
    $paper.style.width = '80vw';
    $paper.style.marginTop = '10%';
    $paper.style.marginBottom = '10%';
    $paper.style.marginLeft = '10%';
    $paper.style.marginRight = '10%';
    $paper.style.backgroundColor = '#fff';
    $paper.style.display = 'flex';
    $paper.style.flexDirection = 'column';
    $paper.style.alignItems = 'center';
    $paper.style.overflowY = 'scroll';
    $paper.style.overflowX = 'scroll';

    myOverlay.appendChild($paper);

    //close button
    let $img = document.createElement('img');
    let $img2 = document.createElement('img');
    $img.src = 'Images/close.png';
    $img2.src = 'Images/close.png';
    $img.style.width = '100%';
    $img2.style.width = '100%';
    let $imgDiv = document.createElement('div');
    let $imgDiv2 = document.createElement('div');
    $imgDiv.appendChild($img);
    $imgDiv2.appendChild($img2);
    $imgDiv.style.width = '25px';
    $imgDiv.style.alignSelf = 'center';
    $imgDiv.style.zIndex = '9999';
    $imgDiv.style.marginBottom = '20px';
    $imgDiv.id = 'closePaper';
    $imgDiv2.style.width = '25px';
    $imgDiv2.style.alignSelf = 'center';
    $imgDiv2.style.zIndex = '9999';
    $imgDiv2.style.marginTop = '20px';
    $imgDiv2.id = 'closePaper2';
    $paper.appendChild($imgDiv);

    if($routeDirectionsArray.length > 0) {

  
        let $d = new Date($routeDirectionsArray[0]);
        let $a = new Date($routeDirectionsArray[1]);

        let $deptP = document.createElement('p');
        let $deptTxt = document.createTextNode('Departure Time: '+$d.toLocaleTimeString());
        $deptP.appendChild($deptTxt);
        $paper.appendChild($deptP);
        $deptP.style.fontWeight = '600';
        $deptP.style.textAlign = 'center';

        let $arrivalP = document.createElement('p');
        let $arrivalTxt = document.createTextNode('Arrival Time: '+$a.toLocaleTimeString());
        $arrivalP.appendChild($arrivalTxt);
        $paper.appendChild($arrivalP);
        $arrivalP.style.fontWeight = '600';
        $arrivalP.style.textAlign = 'center';

        let $dirP = document.createElement('p');
        let $dirTxt = document.createTextNode('Route Directions');
        $dirP.appendChild($dirTxt);
        $paper.appendChild($dirP);
        $dirP.style.fontSize = 'large';
        $dirP.style.fontWeight = '800';
        $dirP.style.color = 'red';
        $dirP.style.textAlign = 'center';

        for(let $kl = 2; $kl < $routeDirectionsArray.length; $kl++) {
            let $p = document.createElement('p');
            let $txt = document.createTextNode($routeDirectionsArray[$kl]);
            $p.appendChild($txt);
            $paper.appendChild($p);
            $p.style.fontWeight = '600';
            $p.style.textAlign = 'center';
        }
        $paper.appendChild($imgDiv2);

    }

    

    myOverlay.style.display = "block";


    $paper.addEventListener("load", function() {

        if(this.height > window.innerHeight) {
            this.ratio = window.innerHeight / this.height;
            this.height = (this.height * this.ratio)-150;
            this.width = (this.width * this.ratio)-150;
        }


        if(this.width > window.innerwidth) {
            this.ratio = window.innerwidth / this.width;
            this.height = (this.height * this.ratio);
            this.width = (this.width * this.ratio);
        }

        centerImage(this);
        myOverlay.appendChild(this);

    }, false);

    

    $imgDiv.addEventListener('click', function() {
        if(myOverlay) {
            window.removeEventListener('scroll', window, false);
            window.removeEventListener('resize', window, false);
            myOverlay.parentNode.removeChild(myOverlay);
        }
    }, false);

    $imgDiv2.addEventListener('click', function() {
        if(myOverlay) {
            window.removeEventListener('scroll', window, false);
            window.removeEventListener('resize', window, false);
            myOverlay.parentNode.removeChild(myOverlay);
        }
    }, false);

    window.addEventListener('scroll', function() {
        if(myOverlay) {
            myOverlay.style.top = window.pageYOffset + "px";
            myOverlay.style.left = window.pageXOffset + "px";
        }
    }, false);

    window.addEventListener('resize', function() {
        if(myOverlay) {
            myOverlay.style.height = window.innerHeight + "px";
            myOverlay.style.width = window.innerWidth + "px";
            myOverlay.style.top = window.pageYOffset + "px";
            myOverlay.style.left = window.pageXOffset + "px";

            centerImage($paper);
        }
    })

});

function centerImage(thePaper) {


    var myDifX = (window.innerWidth - thePaper.width)/2;
    var myDifY = (window.innerHeight - thePaper.height)/2;
    
    myNewDifY = myDifY + 60;
    
    thePaper.style.top = myNewDifY + "px";
    
    thePaper.style.left = myDifX + "px";


    return thePaper;
}

