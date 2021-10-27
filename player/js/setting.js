var YZM = {
	versions: function() {
		var u = navigator.userAgent,
			app = navigator.appVersion;
		return {
			trident: u.indexOf('Trident') > -1,
			presto: u.indexOf('Presto') > -1,
			webKit: u.indexOf('AppleWebKit') > -1,
			gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
			mobile: !!u.match(/AppleWebKit.*Mobile.*/),
			ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
			android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1,
			iPhone: u.indexOf('iPhone') > -1,
			iPad: u.indexOf('iPad') > -1,
			webApp: u.indexOf('Safari') == -1,
			weixin: u.indexOf('MicroMessenger') > -1,
			qq: u.match(/\sQQ/i) == " qq"
		};
	}(),
	'config': {
		"eleId": "player", // 视频容器div的id
		"title": "", // 左上角视频标题
		"color": "#FF556E",
		"logo": "", // 右上角图标
		"url": "", // 视频链接
		"pic": "https://cdn.jsdelivr.net/gh/wen2006953/config/player/img/bg.jpg", // 视频封面
		"next": "", // 下一集链接
		'ads': {
			'pause': { // 暂停时广告图片
				'state': 'off',  // 开启 on
				'link': 'https://cn.bing.com', // 广告链接
				'pic': 'https://cn.bing.com/th?id=OHR.NewtonPumpkins_ZH-CN2560195971_1920x1080.jpg&rf=LaDigue_1920x1080.jpg' // 广告图片
			}
		}
	},
	'start': function(urlOrConfig) {
		if($.isPlainObject(urlOrConfig))
			$.extend(true, this.config, urlOrConfig);
		else
			this.config.url = urlOrConfig;
		
		YZM.play();
	},
	'play': function() {
		YZM.player.play(this.config.url);
		
		$(function() {
			$(".yzmplayer-setting-speeds,.yzmplayer-setting-speed-item").on("click", function() {
				$(".speed-stting").toggleClass("speed-stting-open");
			});
			$(".speed-stting .yzmplayer-setting-speed-item").click(function() {
				$(".yzmplayer-setting-speeds  .title").text($(this).text());
			});
		});
		$(".yzmplayer-fulloff-icon").on("click", function() {
			YZM.dp.fullScreen.cancel();
		});
		$(".yzmplayer-showing").on("click", function() {
			YZM.dp.play();
			$(".vod-pic").remove();
		});
		if (YZM.config.title != '') {
			$("#vodtitle").html(YZM.config.title);
		};
	},
	'def': function() {
		console.log('播放器开启');
		YZM.stime = 0;
		YZM.headt = yzmck.get("headt");
		YZM.lastt = yzmck.get("lastt");
		YZM.last_tip = parseInt(YZM.lastt) + 10;
		YZM.frists = yzmck.get('frists');
		YZM.lasts = yzmck.get('lasts');
		YZM.playtime = Number(YZM.getCookie("time_" + YZM.config.url));
		YZM.ctime = YZM.formatTime(YZM.playtime);
		YZM.dp.on("loadedmetadata", function() {
			YZM.loadedmetadataHandler();
		});
		YZM.dp.on("ended", function() {
			YZM.endedHandler();
		});
		YZM.dp.on('pause', function() {
			YZM.MYad.pause.play(YZM.config.ads.pause.link, YZM.config.ads.pause.pic);
		});
		YZM.dp.on('play', function() {
			YZM.MYad.pause.out();
		});
		YZM.dp.on('timeupdate', function(e) {
			YZM.timeupdateHandler();
		});
		YZM.jump.def()
	},
	'video': {
		'play': function() {
			$("#link3").text("视频已准备就绪，即将为您播放");
			setTimeout(function() {
				YZM.dp.play();
				$("#my-loading", parent.document).remove();
				YZM.jump.head();
			}, 0);
		},
		'next': function() {
			// top.location.href = YZM.config.next;
			YZM.config.url = YZM.config.next;
			YZM.config.next = ''; // 下一集链接
			
			YZM.play();			
		},
		'seek': function() {
			YZM.dp.seek(YZM.playtime);
		},
		'end': function() {
			layer.msg("播放结束啦=。=");
		},
		'con_play': function() {
			YZM.jump.head();
			
			var conplayer = `<e>已播放至${YZM.ctime}，继续上次播放？</e><d class="conplay-jump">是<i id="num">${YZM.waittime}</i>s</d><d class="conplaying">否</d>`
			$("#link3").html(conplayer);
			var span = document.getElementById("num");
			var num = span.innerHTML;
			var timer = null;
			setTimeout(function() {
				timer = setInterval(function() {
					num--;
					span.innerHTML = num;
					if (num == 0) {
						clearInterval(timer);
						YZM.video.seek();
						YZM.dp.play();
						$(".memory-play-wrap,#loading-box").remove();
					}
				}, 1000);
			}, 1);
				
			var cplayer = `<div class="memory-play-wrap"><div class="memory-play"><span class="close">×</span><span>上次看到</span><span>${YZM.ctime}</span><span class="play-jump">跳转播放</span></div></div>`
			$(".yzmplayer-cplayer").append(cplayer);
			$("#my-loading").remove();
			$("#ADmask").css('display', 'none')
			$("#ADmask").remove();
			YZM.dp.play();
			$(".close").on("click", function() {
				$(".memory-play-wrap").remove();
			});
			setTimeout(function() {
				$(".memory-play-wrap").remove();
			}, 20 * 1000);
			$(".conplaying").on("click", function() {
				clearTimeout(timer);
				$("#loading-box").remove();
				YZM.dp.play();
				YZM.jump.head();
			});
			$(".conplay-jump,.play-jump").on("click", function() {
				clearTimeout(timer);
				YZM.video.seek();
				$(".memory-play-wrap,#loading-box").remove();
				YZM.dp.play();
			});
		}
	},
	'jump': {
		'def': function() {
			h = ".yzmplayer-setting-jfrist label";
			l = ".yzmplayer-setting-jlast label";
			f = "#fristtime";
			j = "#jumptime";
			a(h, 'frists', YZM.frists, 'headt', YZM.headt, f);
			a(l, 'lasts', YZM.lasts, 'lastt', YZM.lastt, j);

			function er() {
				layer.msg("请输入有效时间哟！");
			}

			function su() {
				layer.msg("设置完成，将在刷新或下一集生效");
			}

			function a(b, c, d, e, g, t) {
				$(b).on("click", function() {
					o = $(t).val();
					if (o > 0) {
						$(b).toggleClass('checked');
						su();
						g = $(t).val();
						yzmck.set(e, g);
					} else {
						er()
					};
				});
				if (d == 1) {
					$(b).addClass('checked');
					$(b).click(function() {
						o = $(t).val();
						if (o > 0) {
							yzmck.set(c, 0);
						} else {
							er()
						};
					});
				} else {
					$(b).click(function() {
						o = $(t).val();
						if (o > 0) {
							yzmck.set(c, 1);
						} else {
							er()
						};
					});
				}
			};
			$(f).attr({
				"value": YZM.headt
			});
			$(j).attr({
				"value": YZM.lastt
			});
			YZM.jump.last();
		},
		'head': function() {
			if (YZM.stime > YZM.playtime) YZM.playtime = YZM.stime;
			if (YZM.frists == 1) {
				if (YZM.headt > YZM.playtime || YZM.playtime == 0) {
					YZM.jump_f = 1
				} else {
					YZM.jump_f = 0
				}
			}
			if (YZM.headt != null) {
				YZM.dp.seek(YZM.headt);
				YZM.dp.notice("已为您跳过片头");
			}
		},
		'last': function() {
			if (YZM.config.next != '') {
				if (YZM.lasts == 1) {
					setInterval(function() {
						var e = YZM.dp.video.duration - YZM.dp.video.currentTime;
						if (e < YZM.last_tip) YZM.dp.notice('即将为您跳过片尾');
						if (YZM.lastt > 0 && e < YZM.lastt) {
							YZM.setCookie("time_" + YZM.config.url, "", -1);
							YZM.video.next();
						};
					}, 1000);
				};
			} else {
				$(".icon-xj").remove();
			};
		},
		'ad': function(a, b) {}
	},
	'setCookie': function(c_name, value, expireHours) {
		var exdate = new Date();
		exdate.setHours(exdate.getHours() + expireHours);
		if (window.sessionStorage) {
			window.sessionStorage.setItem('playtime', c_name + "=" + escape(value) + ((expireHours === null) ? "" : ";expires=" + exdate.toGMTString()));
		} else {
			document.cookie = c_name + "=" + escape(value) + ((expireHours === null) ? "" : ";expires=" + exdate.toGMTString());
		}
	},
	'getCookie': function(c_name) {
		if (window.sessionStorage) {
			var _session = window.sessionStorage.getItem('playtime');
			if (_session && _session.length > 0) {
				c_start = _session.indexOf(c_name + "=");
				if (c_start !== -1) {
					c_start = c_start + c_name.length + 1;
					c_end = _session.indexOf(";", c_start);
					if (c_end === -1) {
						c_end = _session.length;
					};
					return unescape(_session.substring(c_start, c_end));
				}
			}
		} else {
			if (document.cookie.length > 0) {
				c_start = document.cookie.indexOf(c_name + "=");
				if (c_start !== -1) {
					c_start = c_start + c_name.length + 1;
					c_end = document.cookie.indexOf(";", c_start);
					if (c_end === -1) {
						c_end = document.cookie.length;
					};
					return unescape(document.cookie.substring(c_start, c_end));
				}
			}
		}
		return "";
	},
	'formatTime': function(seconds) {
		return [parseInt(seconds / 60 / 60), parseInt(seconds / 60 % 60), parseInt(seconds % 60)].join(":").replace(/\b(\d)\b/g, "0$1");
	},
	'loadedmetadataHandler': function() {
		if (YZM.playtime > 0 && YZM.dp.video.currentTime < YZM.playtime) {
			setTimeout(function() {
				YZM.video.con_play()
			}, 1 * 1000);
		} else {
			setTimeout(function() {
				YZM.jump.head();
				
				YZM.dp.notice("视频已准备就绪，即将为您播放");
				$("#my-loading", parent.document).remove();
				YZM.video.play()
			}, 0);
		}
		YZM.dp.on("timeupdate", function() {
			YZM.timeupdateHandler();
		});
	},
	'timeupdateHandler': function() {
		YZM.setCookie("time_" + YZM.config.url, YZM.dp.video.currentTime, 24);
	},
	'endedHandler': function() {
		YZM.setCookie("time_" + YZM.config.url, "", -1);
		if (YZM.config.next != '') {
			YZM.dp.notice("5s后,将自动为您播放下一集");
			setTimeout(function() {
				YZM.video.next();
			}, 5 * 1000);
		} else {
			YZM.dp.notice("视频播放已结束");
			setTimeout(function() {
				YZM.video.end();
			}, 2 * 1000);
		}
	},
	'player': {
		'play': function(url) {
			$('body').addClass("danmu-off");
			YZM.dp = new yzmplayer({
				autoplay: true,
				element: document.getElementById(YZM.config.eleId),
				theme: YZM.config.color,
				logo: YZM.config.logo,
				video: {
					url: url,
					pic: YZM.config.pic,
					type: 'auto'
				}
			});
			var css = '<style type="text/css">';
			css += '#loading-box {display: none;}';
			css += '</style>';
			$('body').append(css);
			YZM.def();
		}
	},
	'MYad': {
		'pause': {
			'play': function(l, p) {
				if (YZM.config.ads.pause.state == 'on') {
					var pause_ad_html = '<div id="player_pause"><div class="tip">关闭广告</div><a href="' + l + '" target="_blank"><img src="' + p + '"></a></div>';
					$('#' + YZM.config.eleId).before(pause_ad_html);
					$(".tip").click(function() {
						$("#player_pause").remove();
					});
				}
			},
			'out': function() {
				$('#player_pause').remove();
			}
		}
	}
}