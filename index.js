/**
 * Created by kimdoeun on 2017. 3. 20..
 */

//// Renderer Process에서 실행
var ipcRenderer;  //electron.ipcRendere

function setRenderProcessObj(ipcRen){
    ipcRenderer = ipcRen;
}

function setBadgeRenderer(badgeCount) {

    var text = String(badgeCount);
    if (process.platform === "darwin") {
        //맥에선 이렇게 간편하게 할 수 있다.
        ipcRenderer.send('badge-message', "darwin", badgeCount, true);
    } else if (process.platform === "win32") {  //그러나 윈도우에선 canvas에 그림을 그리고 그데이터를 메인에 넘긴후, 메인에서 native이미지를 생성해서 뱃지 추가한다.
        console.log("wind32임");

        if (text === "") {
            ipcRenderer.send('badge-message', "zero");
            return;
        }

        // Create badge
        var canvas = document.createElement("canvas");
        canvas.height = 140;
        canvas.width = 140;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.fillStyle = "white";

        if (text.length > 2) {
            ctx.font = "75px sans-serif";
            ctx.fillText("" + text, 70, 98);
        } else if (text.length > 1) {
            ctx.font = "100px sans-serif";
            ctx.fillText("" + text, 70, 105);
        } else {
            ctx.font = "125px sans-serif";
            ctx.fillText("" + text, 70, 112);
        }

        console.log("canvas는 : " , canvas);
        badgeDataURL = canvas.toDataURL();
        console.log(badgeDataURL);
        ipcRenderer.send('badge-message', "win32", badgeDataURL);
    }

}




////Main Process 에서 실행

var ipcMain;      //electron.ipcMain
var app;          //electron.app
var mainWindow;   //electron.BrowserWindow
var nativeImage;  //electron.nativeImage

function setMainProcessObj(ipcMainObj, appObj, mainWindowObj, nativeImageObj){
    ipcMain = ipcMainObj;
    app = appObj;
    mainWindow = mainWindowObj;
    nativeImage = nativeImageObj;
}


function setBadgeMain(){
    ipcMain.on('badge-message', function (event, platformStr, arg) {  //렌더러 프로세스로 부터 badge-message이벤트를 받고, 매개변수로 canvas의 dataURL주소를 받는다.
        //console.log(arg);


        if(platformStr === "darwin") {
            app.dock.setBadge("" + arg);
        } else if(platformStr === "win32") {
            var newImage = nativeImage.createFromDataURL(arg); //createFromDataURL메소드로 native이미지(png나 jpeg같은 것)를 생성한다.
            mainWindow.setOverlayIcon(newImage, '');
        } else if (platformStr === "zero") {
            mainWindow.setOverlayIcon(null,"");
        }


    });
}

exports.setBadgeRenderer = setBadgeRenderer;
exports.setRenderProcessObj = setRenderProcessObj;
exports.setMainProcessObj = setMainProcessObj;
exports.setBadgeMain = setBadgeMain;