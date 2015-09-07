(function ( $ ) {
    // body...
    $.fn.jLyric = function(options){

        var opts = $.fn.jLyric.options = $.extend( {} , $.fn.jLyric.defaults , options );

        this.each(function(){
            var lrcTmp = [opts.lyricHeaderString,opts.lyricString,"\n",opts.lyricFooterString].join('').split("\n"),
                timeTmpLine = [],
                lrcTmpLine = []; //打散为字符串数组

            for (var i in lrcTmp) {
               timeTmpLine = expStr(lrcTmp[i])[0];
               lrcTmpLine = expStr(lrcTmp[i])[1];

               opts.timeLine = opts.timeLine.concat(timeTmpLine);
               opts.lrcLine = opts.lrcLine.concat(lrcTmpLine);
            }
            var len = opts.lrcLine.length,
                strex = exportToElement(opts.timeLine, opts.lrcLine);

            $(this).html("<div id=\"jLyric\">"+strex.join("")+"</div>");
            opts.timeLine.sort(function(a, b) {
                return a > b ? 1 : -1;
            });
          opts.mediaPlayer = $(opts.mediaPlayer) || $("audio")[0];
          opts.$this=$(this);
          $("#jLyric").css("margin",opts.displayLine*opts.lineHeight+"px auto");
          opts.$this.css("height",(opts.displayLine*2+1)*opts.lineHeight);
		  $(document).on("click","#jLyric",function(e) {
			  ;console.log(e);
		  });
          setTimeout(intervalTask, 10);
        });
    };

    //defaults pram

    $.fn.jLyric.defaults = {
        lyricString:"[00:00.00] 木有歌词 -_-#\n",
        lyricHeaderString:"[00:00.00] music...\n",
		lyricFooterString:"",
        $this: "",
        timeLine : [],
        lrcLine :[],
        targetLineTime : 0,
        targetTime: 0,
        currentItem : 0,
        mediaPlayer : "#audio",
      	delayTime:-200,//-为提前+为滞后
      	displayLine:0,//2n+1   0、1、2 -> 1、3、5
      	lineHeight:30,
      	currentTag:"current",
      	lyricItemTag:"jLyric-item-",
		lyricTag:"#jLyric",
      	fontSize:0,
		lazyTime:3000,
		startTime:-1000
    }

    function intervalTask() {
        var options=$.fn.jLyric.options;
      
        var mediaCurrentTime = Math.floor(options.mediaPlayer.prop("currentTime") * 1000) || options.mediaCurrentTime,
            len = options.timeLine.length,
            nextTime;
      	mediaCurrentTime-=options.delayTime;
        for(var k=0;k<len;k++)
        {
          if(k<len-1)
            nextTime=options.timeLine[k+1];
          else
            nextTime=options.timeLine[k] * 2;
          if (options.timeLine[k] < mediaCurrentTime && mediaCurrentTime < nextTime)
          {
            $("."+options.currentTag).removeClass("current");
            $("#"+options.lyricItemTag + k).addClass("current");
            options.currentItem=k;
            break;
          }
        }

        if (!options.mediaPlayer.prop("paused") && Math.abs(options.targetTime) > 1 ) {
            if (options.targetTime<0)
                options.$this.scrollTop(options.$this.scrollTop()+1);
            else
                options.$this.scrollTop(options.$this.scrollTop()-1);
            options.targetTime=0;
        }
        options.targetTime+=options.targetLineTime;
		if (!options.mediaPlayer.prop("paused") && Math.abs(mediaCurrentTime - options.startTime) > options.lazyTime)
		{
            options.$this.scrollTop( options.$this.scrollTop() - scrollValue(options.currentItem, options.$this.scrollTop(), options.lineHeight));
		}
		setTimeout(intervalTask, 10);
    }

    function exportToElement(timeL, lrcL) {
        var len = timeL.length,
            j = 0,
            i = 0,
            eleText = [],
            time = timeL.concat();
        time.sort(function(a, b) {
            return a > b ? 1 : -1
        });
        var maxTime = 0;
        for (i = 0; i < len; i++) { //i控制顺序时间线，作为基线比对
			var idx = timeL.indexOf(time[i]);
			maxTime=timeL[idx];
			eleText.push(["<div lang=" , maxTime , " id=\"" , $.fn.jLyric.options.lyricItemTag , i , "\" >" , lrcL[idx].trim() , "</div>"].join(''));
			/*
            for (j = 0; j < len; j++) { //作为自由时间线，比对对象
                if (time[i] === timeL[j]) {
                    maxTime = time[i];
                    console.log("<" + maxTime + ">" + lrcL[j] + j);
                    eleText.push("<div lang=" + maxTime + " id=\"" + $.fn.jLyric.options.lyricItemTag + i + "\" >" + lrcL[j].trim() + "</div>");
                    break;
                }
            }*/
        }
        return eleText;
    }
    function expStr(str) {
        var temp = [],
            timeline = [],
            lrcline = [];
        var rgExp = /(\[\d.\:\d.\.\d.\])/g; //匹配时间标签
        var timestamp = str.match(rgExp);
        var lrc = str.replace(/(\[[^\n]+\])/g, ""); //匹配非时间标签元素eg:[ti：xxxx]
        for (var i in timestamp) {
            timeline.push(toInt(timestamp[i])); //转换为时间ms
            lrcline.push(lrc);
        }
        temp.push(timeline); //[0]时间线
        temp.push(lrcline); //[1]歌词线
        return temp;
    }
    function toInt(x) {
        var min = /\[(\d.)\:/g;
        var sec = /\:(\d.)\./g;
        var mse = /\.(\d.)\]/g;
        var time = parseInt(min.exec(x)[1]) * 60 * 1000; //构建时间
        time += parseInt(sec.exec(x)[1]) * 1000;
        time += parseInt(mse.exec(x)[1]) * 10;
        return time;
    }
    function scrollValue(arrIndex,currentScrollValue,divHeight){
        var ab=currentScrollValue-(arrIndex*divHeight),
            abs=Math.abs(ab),
            ret=0;
        if (abs>0)
        {
           ret=ab/30;
        }
        if (abs<31)
          $.fn.jLyric.options.targetLineTime=Math.floor( ab/30 );
        return ret;
    }
})(jQuery)