var miniGAL = {};

miniGAL.em = null;

miniGAL.mainCanvas = null;

miniGAL.playAudioJqueryObject = null;
miniGAL.setMainCanvas = function(jqueryObj) {
    miniGAL.mainCanvas = jqueryObj;
}

miniGAL.playMusicAudio = function(jqueryAudio) {
    jqueryAudio.get(0).play();
}

miniGAL.stopMusicAudio = function(jqueryAudio) {
    jqueryAudio.get(0).pause();
    jqueryAudio.get(0).currentTime = 0;
}

miniGAL.resources = new Map();
miniGAL.resourceProcess = 0;
miniGAL.preLoad = function(resources, jqueryBar, gameStartFunction) {
    var picSuffix = ["jpg", "png", "bmp", "gif"];
    var musicSuffix = ["mp3", "wav", "ogg"];
    for(var i = 0; i < resources.length; i++) {
        var parts = resources[i].src.split(".");
        var suffix = parts[parts.length - 1];
        if(picSuffix.indexOf(suffix) !== -1) {
            var im = new Image();
            im.src = resources[i].src;
            im.rsrc = resources[i].src;
            miniGAL.resources.set(resources[i].key, im);
            
            im.onload = function() {
                miniGAL.resourceProcess++;
                if(jqueryBar !== null)
                    jqueryBar.css("width", miniGAL.resourceProcess / resources.length * 100 + "%");
                if(miniGAL.resourceProcess === resources.length) gameStartFunction();
            }
        }
        if(musicSuffix.indexOf(suffix) !== -1) {
            var em = $("<audio></audio>");
            em.removeAttr("autoplay");
            em.attr("loop", "-1");
            em.attr("src", resources[i].src);
            miniGAL.mainCanvas.append(em);
            miniGAL.resources.set(resources[i].key, em);
            
            miniGAL.resourceProcess++;
            if(jqueryBar !== null)
                jqueryBar.css("width", miniGAL.resourceProcess / resources.length * 100 + "%");
            if(miniGAL.resourceProcess === resources.length) gameStartFunction();
        }
    }
}

miniGAL.cmdQueue = [];
miniGAL.backgroundImage = null;
miniGAL.back_lu = 0, miniGAL.back_ld = 0, miniGAL.back_ru = 0, miniGAL.back_rd = 0;
miniGAL.back_height = 0, miniGAL.back_width = 0;
miniGAL.resetBackground = function(fade, nextFunction) {
    var width, height;
    if(miniGAL.mainCanvas.is('body')) {
        width = $(window).width();
        height = $(window).height();
    } else {
        width = miniGAL.mainCanvas.attr("width");
        height = miniGAL.mainCanvas.attr("height");
    }
    if(width === undefined) width = 0;
    if(height === undefined) height = 0;
    var img = fade? $(miniGAL.backgroundImage): $("img.background-img");
    var picwidth = miniGAL.backgroundImage.naturalWidth;
    var picheight = miniGAL.backgroundImage.naturalHeight;
    var bl = picwidth / picheight;
    img.css("position", "absolute");
    img.addClass("background-img");
    if(width / height > picwidth / picheight) {
        img.css("height", height);
        img.css("width", bl * height)
        img.css("top", "0");
        img.css("left", (width - bl * height) / 2);
        miniGAL.back_lu = {ttop: 0, left: (width - bl * height) / 2};
        miniGAL.back_ld = {ttop: height, left: (width - bl * height) / 2};
        miniGAL.back_ru = {ttop: 0, left: (width - bl * height) / 2 + bl * height};
        miniGAL.back_rd = {ttop: height, left: (width - bl * height) / 2 + bl * height};
        miniGAL.back_height = height;
        miniGAL.back_width = bl * height;
    } else {
        img.css("width", width);
        img.css("height", width / bl);
        img.css("top", (height - width / bl) / 2);
        img.css("left", "0");
        miniGAL.back_lu = {ttop: (height - width / bl) / 2, left: 0};
        miniGAL.back_ld = {ttop: (height - width / bl) / 2 + width / bl, left: 0};
        miniGAL.back_ru = {ttop: (height - width / bl) / 2, left: width};
        miniGAL.back_rd = {ttop: (height - width / bl) / 2 + width / bl, left: width};
        miniGAL.back_height = width / bl;
        miniGAL.back_width = width;
    }
    if(fade) {
        img.hide();
        miniGAL.mainCanvas.append(img);
        img.fadeIn(300, nextFunction);
    } else {
        if(nextFunction !== null && nextFunction !== undefined)
            nextFunction();
    }
}

miniGAL.resetDialogByBackground = function() {
    console.log(miniGAL.dialog);
    
    var left = miniGAL.back_lu.left + miniGAL.back_width / 20;
    var right = miniGAL.back_lu.left + miniGAL.back_width / 20 * 19;
    var up = miniGAL.back_lu.ttop + miniGAL.back_height / 1.5;
    var down = miniGAL.back_lu.ttop + miniGAL.back_height / 20 * 19;
    console.log(miniGAL.back_lu)
    console.log(up, left, right - left, down - up)
    miniGAL.dialog.css("top", up);
    miniGAL.dialog.css("left", left);
    miniGAL.dialog.css("width", right - left);
    miniGAL.dialog.css("height", down - up);
    miniGAL.dialog.css("font-size", (down - up) / 8);
}

miniGAL.playMusic = function(musicKey) {
    miniGAL.cmdQueue.push({cmd: "playMusic", target: musicKey});
}
miniGAL.exePlayMusic = function (cmdObject) {
    if(miniGAL.playAudioJqueryObject !== null)
        miniGAL.stopMusicAudio(miniGAL.playAudioJqueryObject);
    miniGAL.playMusicAudio(miniGAL.resources.get(cmdObject.target));
    miniGAL.playAudioJqueryObject = miniGAL.resources.get(cmdObject.target);
}

miniGAL.background = function(backgroundKey) {
    miniGAL.cmdQueue.push({cmd: "background", target: backgroundKey});
}
miniGAL.exeBackground = function(cmdObject, nextFunction) {
    var target = cmdObject.target;
    if(miniGAL.backgroundImage === null) {
        miniGAL.backgroundImage = miniGAL.resources.get(target);
        miniGAL.resetBackground(true, nextFunction);
    } else {
        miniGAL.backgroundImage = miniGAL.resources.get(target);
        var backImg = $("img.background-img");
        backImg.animate({opacity: 0}, 150, function() {
            backImg.attr("src", miniGAL.resources.get(target).rsrc);
            miniGAL.resetBackground(false);
            backImg.animate({opacity: 1}, 150, nextFunction);
        });
    }
}

miniGAL.waitclick = function() {
    miniGAL.cmdQueue.push({cmd: "waitclick", target: null});
}
miniGAL.exeWaitclick = function(nextFunction) {
    var backImg = $("img.background-img");
    backImg.click(function() { nextFunction(); $(this).unbind("click"); });
}

miniGAL.dialog = null;
miniGAL.addDefaultDialog = function(args) {
    miniGAL.cmdQueue.push({cmd: "addDefaultDialog", target: args});
}
miniGAL.execAddDefaultDialog = function(args) {  // color, (border-)radius, opacity
    var color = args === undefined || args.color === undefined? "#FA8072": args.color;
    var radius = args === undefined || args.radius === undefined? 3: args.radius;
    var opacity = args === undefined || args.opacity === undefined? 0.9: args.opacity;
    if(miniGAL.dialog === null) {
        miniGAL.dialog = $('<div class="dialog"></div>');
        miniGAL.dialog.css("position", "absolute");
        miniGAL.dialog.css("background-color", color);
        miniGAL.dialog.css("border-radius", radius);
        miniGAL.dialog.css("opacity", 0);
        miniGAL.dialog.opacity = opacity;
        miniGAL.dialog.css("width", 500);
        miniGAL.dialog.css("height", 500);
        miniGAL.dialog.css("z-index", 10);
        miniGAL.mainCanvas.append(miniGAL.dialog);
        miniGAL.resetDialogByBackground();
    } else {
        miniGAL.dialog.css("background-color", color);
        miniGAL.dialog.css("border-radius", radius);
        miniGAL.dialog.opacity = opacity;
    }
    miniGAL.exec();
}

miniGAL.dialogHide = function(time) {
    miniGAL.cmdQueue.push({cmd: "dialogHide", target: time === null || time === undefined? 250: time});
}
miniGAL.exeDialogHide = function(cmdObject) {
    miniGAL.dialog.animate({opacity: 0}, cmdObject.target, miniGAL.exec);
}

miniGAL.dialogShow = function(time) {
    miniGAL.cmdQueue.push({cmd: "dialogShow", target: time === null || time === undefined? 250: time});
}
miniGAL.exeDialogShow = function(cmdObject) {
    miniGAL.dialog.animate({opacity: miniGAL.dialog.opacity}, cmdObject.target, miniGAL.exec);
}

miniGAL.text = function(name, content) {
    miniGAL.cmdQueue.push({cmd: "text", target: {name: name, content: content}});
}
miniGAL.exeText = function(cmdObject) {
    alert(cmdObject.target.name + "\n" + cmdObject.target.content);
    miniGAL.dialog.html(cmdObject.target.name + "<br>" + cmdObject.target.content);
}

miniGAL.exec = function() {
    if(miniGAL.cmdQueue.length === 0) { alert("over"); return; }
    var cmd = miniGAL.cmdQueue.shift();
    console.log(cmd);
    if(cmd.cmd === "playMusic") {
        miniGAL.exePlayMusic(cmd);
        miniGAL.exec();
    }
    if(cmd.cmd === "background") {
        miniGAL.exeBackground(cmd, miniGAL.exec);
    }
    if(cmd.cmd === "waitclick") {
        miniGAL.exeWaitclick(miniGAL.exec);
    }
    if(cmd.cmd === "addDefaultDialog") {
        miniGAL.execAddDefaultDialog(cmd.target);
    }
    if(cmd.cmd === "dialogHide") {
        miniGAL.exeDialogHide(cmd);
    }
    if(cmd.cmd === "dialogShow") {
        miniGAL.exeDialogShow(cmd);
    }
    if(cmd.cmd === "text") {
        miniGAL.exeText(cmd);
    }
}

miniGAL.start = function () {
    
    // remove everything in the main canvas except audios
    miniGAL.mainCanvas.children().not("audio").remove();
    miniGAL.mainCanvas.css("")
    if(miniGAL.mainCanvas.is('body')) {
        $(window).resize(function(){
           miniGAL.resetBackground(false);
           miniGAL.resetDialogByBackground();
        });
    }
    miniGAL.exec()
}
