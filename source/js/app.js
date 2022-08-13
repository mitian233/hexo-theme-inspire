/*
 * Application js
 */

var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');

function isNumber(value) {
    var patrn = /^(-)?\d+(\.\d+)?$/;
    if (patrn.exec(value) == null || value == "") {
        return false
    } else {
        return true
    }
}

App = {
	// ~~~ 鼠标事件
	mouseEvent:function() {
		// 显示隐藏访客资料编辑框
		$('#respond .edit-profile').on('click', function() {
		    var author_info = $('#respond .author-info'),
		        mark = $('.visitor .mark'),
		        aria_label = $('.visitor .edit-profile'),
		        time = new Date(),
		        time = time.toLocaleTimeString();
		    if (author_info.hasClass('edit-off')){
		        author_info.removeClass('edit-off').addClass('edit-on');
		        mark.hide();
		        aria_label.attr('aria-label',time);
		    }
		    else {
		        author_info.removeClass('edit-on').addClass('edit-off');
		        mark.show();
		        aria_label.attr('aria-label','修改名片');
		    }
		});

		// 展开评论框
		var _shrink = $('textarea#comment'),
		    __shrink = $('.comment-submit');
		_shrink.on('focus', function() {
		    $(this).removeClass('shrink');
		    __shrink.removeClass('shrink');
		}).on('blur', function(){
		    if ($(this).val() == '') {
		        //$(this).addClass('shrink');
		        //__shrink.addClass('shrink');
		    }
		});

		// 修改头像
		$("input#email").blur(function() {
		    var _email = $(this).val();
		    if (_email != '') {
		        $.ajax({
		            type: 'GET',
		            data: {
		                action: 'ajax_avatar_get',  
		                form: E.ajaxurl,
		                email: _email
		            },
		            success: function(data) {
		                $('.visitor .avatar').attr('src', data);
		            }
		        }); // end ajax
		    }

		    return false;
		});

		// QQ资料
		$("input#author").blur(function() {
		    var _author = $(this).val();
		    if (_author) {
			    if (isNumber(_author)) {
			        $.getJSON(E.ajaxurl+'?action=ajax_qq_info&qqNum='+_author, function(xhr) {
			        	if (xhr[_author] == undefined) {
			        		tips_update('你的QQ号不存在，请检查，如果不使用QQ号，建议使用中英文昵称。');
			        		$("input#author").focus();
			        	} else if(xhr[_author][6] == "") {
				        	tips_update('你的QQ号可能是长期不登录或冻结状态？请检查。');
				        	$("input#author").focus();
			        	} else {
			        		$("input#author").val(xhr[_author][6]);
				        	$("input#email").val(_author+'@qq.com');
				        	$("input#url").val('https://user.qzone.qq.com/'+_author);
				        	$('#comment').focus();
				        	//console.log(xhr);
			        	}
			        });
			    }
			}
		    return;
		});

		// 滚动
	    $('#directory-content a[href*="#"]:not([href="#"])').click(function() {
	        if ( location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname ) {
	            var target = $(this.hash);
	            target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
	            if (target.length) {
	                $("html, body").animate({
	                        scrollTop: target.offset().top - 80
	                    },
	                    500
	                );
	                return false;
	            }
	        }
	    });

	    // 分享
		$('.share').on('click', function(e) {
			share = $('#share');
			_this = $(this);
			
			if (!$('#share.show')[0]) {
				share.fadeIn(100);
				_this.addClass('show');
			}

			$(document).on('click', function() {
				share.fadeOut(100);
				_this.removeClass('show');
			});
			e.stopPropagation();

			share.on('click', function(e) {
				e.stopPropagation();
			});
		});

		// 灯箱
		baguetteBox.run('.attachmentimage, .content .entry-content', {
		    captions: function(element) {
		        return element.getElementsByTagName('img')[0].alt;
		    }
		});

		// 目录导航
		$('.content .entry-content h2').each(function(i) {
        	j = i++;
        	$(this).attr('id','directory-'+j);
    	});

    	// 评论贴图
    	$('#addCommentImgae').on('click', function(e) {
			var URL = prompt('请输入图片 URL 地址:', 'https://');
			if (URL) {
				document.getElementById('comment').value = document.getElementById('comment').value + '' + URL + '';
			}
    	});

	},

	// ~~~ 评论提交
	commentPush:function() {
		var edit_mode = E.comment.edit, // 再编辑模式
		edt1 = '提交成功，在刷新页面之前你可以<a rel="nofollow" class="comment-reply-link" href="#edit" onclick=\'return addComment.moveForm("',
		edt2 = ')\'>重新编辑</a>',
		cancel_edit = '取消', edit, re_edit, num = 1, comm_array=[], $body, wait = 15,
		$comments = $('#comments-title'), // 评论数的 ID
		$cancel = $('#cancel-comment-reply-link'),
		cancel_text = $cancel.text(),
		$submit = $('#commentform #button'),
		err = $('.comment-textarea.error'),
		push_status = $('#commentform #button.push-status'),
		err_cue = 'tips-top tips-always',
		null_list = $('.null-commentlist');
		comment_validate = $('#comment-validate');

		$submit.attr('disabled', false);
		comm_array.push(''); //重新编辑不显示内容
		// submit
		$('#commentform').submit(function() {
		    push_status.html('正在提交...');
		    $submit.attr('disabled', true).fadeTo('slow', 0.5);
		    if ( edit ) $('#comment').after('<input type="text" name="edit_id" id="edit_id" value="' + edit + '" style="display:none;" />');
		    
		    // Ajax
		    $.ajax({
		        url: E.ajaxurl,
		        data: $(this).serialize() + "&action=ajax_comment_post",
		        type: $(this).attr('method'),
		        error: function(request) {
		            push_status.html('重新提交');
		            err.attr('aria-label', request.responseText).addClass(err_cue);
		            setTimeout(function() {
		                $submit.attr('disabled', false).fadeTo('slow', 1);
		                err.removeClass(err_cue);
		            }, 3000);
		            $('#comment-validate').each(function() {this.value = ''});
		        },
		        success: function(data) {
		            
		            comm_array.push($('#comment').val());
		            $('textarea').each(function() {this.value = ''});
		            var t = addComment, cancel = t.I('cancel-comment-reply-link'), temp = t.I('wp-temp-form-div'), respond = t.I(t.respondId), post = t.I('comment_post_ID').value, parent = t.I('comment_parent').value;
		            
		            // comments
		            if ( ! edit && $comments.length ) {
		                n = parseInt($comments.text().match(/\d+/));
		                $comments.text($comments.text().replace( n, n + 1 ));
		            }
		            // show comment
		            new_item = '"id="new-comment-' + num + '"></';
		            new_item = ( parent == '0' ) ? ('\n<div class="depth-new' + new_item + 'div>') : ('\n<ol class="children' + new_item + 'ol>');
		            cue = '\n <div class="ajax-edit"><span class="edit-cue" id="success-' + num + '">';
		            if ( edit_mode == 'on' ) {
		                div_ = (document.body.innerHTML.indexOf('div-comment-') == -1) ? '' : ((document.body.innerHTML.indexOf('li-comment-') == -1) ? 'div-' : '');
		                cue = cue.concat(edt1, div_, 'comment-', parent, '", "', parent, '", "respond", "', post, '", ', num, edt2);
		            }
		            cue += '</span><span></span></div>\n';

		            if ( ( parent == '0' ) ) {
		                if ( !$( 'ol.commentlist' )[0] ) {
		                    $( '.comments-wrap' ).append('<ol class="commentlist"></ol>'); // 文章没有评论时。
		                    $( '.not-comment' ).remove();
		                }
		                $( 'ol.commentlist' ).prepend(new_item);
		            }
		            else {
		                $('#respond').before(new_item);
		            }
		            if (null_list.length > 0) null_list.remove();
		            $('#new-comment-' + num).hide().append(data).fadeIn(400); //插入新提交评论
		            $('#new-comment-' + num + ' li').append(cue);

		            CountDown(); num++ ; edit = ''; $('*').remove('#edit_id');
		            cancel.style.display = 'none';//“取消回复”消失
		            cancel.onclick = null;
		            t.I('comment_parent').value = '0';
		            if ( temp && respond ) {
		                temp.parentNode.insertBefore(respond, temp);
		                temp.parentNode.removeChild(temp)
		            }
		            
		            //Add by dong:recent-comments
		            //recent_comments_new(data);
		            $('#comment-validate').each(function() {this.value = ''});
		        }
		    }); // end Ajax
		  return false;
		}); // end submit
		// comment-reply.dev.js
		addComment = {
		    moveForm : function(commId, parentId, respondId, postId, num) {
		        var t = this, div, comm = t.I(commId), respond = t.I(respondId), cancel = t.I('cancel-comment-reply-link'), parent = t.I('comment_parent'), post = t.I('comment_post_ID');
		        if ( edit ) PrevEdit();
		        num ? (
		            t.I('comment').value = comm_array[num],
		            edit = t.I('new-comment-' + num).innerHTML.match(/(comment-)(\d+)/)[2],
		            $new_sucs = $('#success-' + num ), $new_sucs.hide(),
		            $new_comm = $('#new-comment-' + num ), $new_comm.hide(),
		            $cancel.text(cancel_edit)
		        ) : $cancel.text(cancel_text);

		        t.respondId = respondId;
		        postId = postId || false;

		        if ( !t.I('wp-temp-form-div') ) {
		            div = document.createElement('div');
		            div.id = 'wp-temp-form-div';
		            div.style.display = 'none';
		            respond.parentNode.insertBefore(div, respond);
		        }

		        !comm ? ( 
		            temp = t.I('wp-temp-form-div'),
		            t.I('comment_parent').value = '0',
		            temp.parentNode.insertBefore(respond, temp),
		            temp.parentNode.removeChild(temp)
		        ) : comm.parentNode.insertBefore(respond, comm.nextSibling);

		        if ( post && postId ) post.value = postId;
		        parent.value = parentId;
		        cancel.style.display = '';

		        cancel.onclick = function() {
		            if ( edit ) PrevEdit();
		            var t = addComment, temp = t.I('wp-temp-form-div'), respond = t.I(t.respondId);

		            t.I('comment_parent').value = '0';
		            if ( temp && respond ) {
		                temp.parentNode.insertBefore(respond, temp);
		                temp.parentNode.removeChild(temp);
		                $('#comment').val('');
		            }
		            this.style.display = 'none';
		            this.onclick = null;
		            return false;
		        };

		        try { t.I('comment').focus(); }
		        catch(e) {}

		        return false;
		    },

		    I : function(e) {
		        return document.getElementById(e);
		    }
		}; // end addComment
		function PrevEdit() {
		    $new_comm.show(); $new_sucs.show();
		    $('textarea').each(function() {this.value = ''});
		    edit = '';
		    $('#comment-validate').each(function() {this.value = ''});
		} // End PrevEdit
		function CountDown() {
		    if ( wait > 0 ) {
		        push_status.html(wait+'s'); wait--; setTimeout(CountDown, 1000);
		    }
		    else {
		        push_status.html('推送');
		        $submit.attr('disabled', false).fadeTo('slow', 1);
		        wait = 15;
		        $('#comment-validate').each(function() {this.value = ''});
		    }
		} // End CountDown
	},

	// ~~~ 文章列表分页
	postsPaging:function() {
		$('body').on('click', '.posts-paging a', function() {
		    $(this).hide();
		    paging = $('.posts-paging');
		    loading_start(paging);
		    $.ajax({
		        type: 'POST',
		        url: $(this).attr('href'),
		        success: function(data) {
		            result = $(data).find('#main .post');
		            nextHref = $(data).find('.posts-paging a').attr('href');
		            $('#main #primary').append(result.fadeIn(400));
		            loading_done(paging);
		            if ( nextHref != undefined ) {
		                $('.posts-paging a').attr('href', nextHref).show();
		            }
		            else {
		                $('.posts-paging').html("<span>Don't have more</span>");
		            }
		            App.Postmusic();
		            $body.animate({scrollTop: result.offset().top - 58}, 500 );
		        }
		    }); // end ajax

		    return false;
		});
	},

	// ~~~ 评论列表分页
	commentsPaging:function() {
		$('body').on('click', '.comments-paging a.page-numbers', function(e) {
		    e.preventDefault();
		    $.ajax({
		        type: 'GET',
		        url: $(this).attr('href'),
		        beforeSend: function(){
		            $('ol.commentlist').html('');
		            loading_start($('ol.commentlist'));
		        },
		        dataType: 'html',
		        success: function(out){
		            result = $(out).find('ol.commentlist');
		            nextlink = $(out).find('.comments-paging');
		            $('ol.commentlist').html(result.slideDown(10));
		            $('#pagination').html(nextlink);
		            $body.animate({scrollTop: $('.comments-wrap').offset().top - 60}, 300);
		        }
		    }); // end ajax

		    return;
		});
	},

	codeLight:function () {
		$('pre code').each(function(i, block) {
			hljs.highlightBlock(block);
		}); 
	},

	gotop:function() {
		var offset = 400,
		scroll_top_duration = 500,
		$back_to_top = $('.gotop');
		$(window).scroll(function() {
			( $(this).scrollTop() > offset ) ? $back_to_top.addClass('show') : $back_to_top.removeClass('show');
		});
		$back_to_top.on('click', function(event){
			event.preventDefault();
			$('body,html').animate({
			    scrollTop: 0 ,
			    }, scroll_top_duration
			);
		});
	},

	loginValidate:function() {
		$('.login #button').on('click', function(e) {
			var name = $('.login #log'),
			pwd = $('.login #pwd'),
			validate = $('.login #validate'),
			num1 = parseInt($('.login #num1').val()),
			num2 = parseInt($('.login #num2').val());
			var num3 = num1 + num2;
			if (name.val() == '') {
				e.preventDefault();
				tips_update('登录异常：请输入用户名');
			}
			else if (pwd.val() == '') {
				e.preventDefault();
				tips_update('登录异常：请输入密码');
			}
			else if (validate.val() == '') {
				e.preventDefault();
				tips_update('登录异常：请输入验证码');
			}
			else if(parseInt(validate.val()) != num3) {
				e.preventDefault();
				tips_update('登录异常：验证码错误');
			}
			else {
				return;
			}
		});
	},

	Input: function(){
        POWERMODE.colorful = true; // make power mode colorful
        POWERMODE.shake = false; // turn off shake
        document.body.addEventListener('input', POWERMODE)
    },

    Bgvideo: function() {
    	if (E.bgv == 'on') {
    		var _video = $('#bgvideo video');
    		$('#bgvideo').css('z-index','0');
    		_video.addClass('instate');
    		_video[0].play();
    		//console.log('可以播放');
    		_video[0].onended = function() {
    			_video.attr('src', '').removeClass('instate').hide();
    		}
    	}
    },

    Postindex: function() {
    	if ($('#directory-content')[0]) {
	    	var postDirectory = new Headroom(document.getElementById("directory-content"), {
			tolerance: 0,
			offset: 500,
			classes: {
				initial: "initial",
				pinned: "pinned",
				unpinned: "unpinned"
			}
			});
			postDirectory.init();
		}
    },

    Postmusic: function() {
    	if ( E.bgm.audio && E.screen == 'pc' ) {
    		single_music();
    	}
    }

}

//////// Executive function /////////
App.gotop();
App.mouseEvent();
App.commentPush();
App.postsPaging();
App.commentsPaging();
hljs.initHighlightingOnLoad();
App.Input();
App.Bgvideo();
App.Postindex();
App.Postmusic();

if ( $('.no-asynchronous')[0] ) {
    $(document).pjax('a[target!=_top]', '#container', {
        fragment: '#container',
        timeout: 8000,
    }).on('pjax:send', function() {
        NProgress.start();
    }).on('pjax:complete', function() { 
        NProgress.done();
        App.mouseEvent();
        App.commentPush();
		App.codeLight();
		App.Postindex();
		App.Postmusic();
        $('#fixedbar.no').FixedBar('fix');

        if ($('#primary').hasClass('content'))
            $body.animate({scrollTop: $('#appbar').offset().top + 1}, 600 );
        
    }).on('submit', '.searchform', function (e) {
        e.preventDefault();
        $.pjax.submit(e, '#container', {
            fragment:'#container', 
            timeout:8000,
        });
        $('.searchform input').val('');
        $body.animate({scrollTop: $('#appbar').offset().top + 1}, 900 );
    });

    window.addEventListener('popstate',function(e) {
        App.mouseEvent();
        App.commentPush();
		App.codeLight();
		$('#fixedbar.no').FixedBar('fix');
    }, false);
}

$('body').on('click', '.preview .post', function(e) {
    var tags = 'a,li,span', targetObj = e.srcElement ? e.srcElement : e.target; // 排除某些标签
    if ( !$(targetObj).parents().andSelf().is(tags) ) {
        set_obj($(this), 'post', function() {
			App.mouseEvent();
			App.commentPush();
			App.codeLight();
			App.Postmusic();
        });
    }
});

$.fn.FixedBar = function(name){
    var that = $(this);
    if (that[0]) {
        var tooltip = $('.master-info-small .tooltip'),
            avatar = $('.master-info .sns-avatar'),
            offsetTop = that.offset().top,
            scrollTop;
        function fix() {
            scrollTop = $(document).scrollTop();   
            if (scrollTop > offsetTop ) {
                that.addClass(name);
                tooltip.css({'margin-top':'0px'});
                avatar.css({'margin-bottom':'90px'});
            }
            else {
                that.removeClass(name);
                tooltip.css({'margin-top':'55px'});
                avatar.css({'margin-bottom':'0px'});
            }
        }
        fix(); $(window).scroll(fix);
    }
}
$('#fixedbar.no').FixedBar('fix');

$('.login').on('click', function() {
    var this_url = document.URL,
    class_name = 'account';
    overlay_add(class_name);
    var modal = $('#overlay #modal');
    loading_start(modal);
    $.ajax({
        type: 'POST',
        data: { 
            action: 'ajax_login_post',
            form: E.ajaxurl,
            this_url: this_url
        },
        dataType: 'html',
        success: function(data) {
            modal.html(data);
            App.loginValidate();
        }
    }); // end ajax

    overlay_remove(class_name);
    return false;
});

$('#mobilebar .switch').on('click', function() {
    var mobile = $('#overlay.mobile');
    mobile.fadeIn(200);
    var item = $('.mobile .menu-item');
    mobile.click(function(e) {
        if(e.target.id == 'overlay') {
            mobile.fadeOut(200);
        }
    });
    item.click(function() {
        mobile.fadeOut(200);
    });
});

$.fn.Like = function() {
    if ($(this).hasClass('is-active'))
    	return false;

    var id = $(this).data('id'),
    action = $(this).data('action'),
    rateHolder = $('.likes .state-count');
    var ajax_data = {
        action: "post_like",
        um_id: id,
        um_action: action
    };
    $.post(E.ajaxurl, ajax_data, function(data) {
        $(rateHolder).html(data);
    });

    $(this).addClass('is-active');

    return false;
};
$(document).on("click", ".ilike", function() {
    $(this).Like();
});