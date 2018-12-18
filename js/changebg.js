//copy from net

//实现在指定图片集中随机替换背景图片

var imgArr=[
    "images/background1.jpg"
]; 
 

var index =parseInt(Math.random()*(imgArr.length-1)); 

var currentImage=imgArr[index]; 

document.getElementById("BackgroundArea").style.backgroundImage="url("+currentImage+")"; 
