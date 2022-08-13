$(function() {
    // $('.get-json').bind('submit', function() {
    //     var mid = $('.bgm-get #mid').val(), 
    //         type = $('.bgm-get #music-type').val(), 
    //         source;
    //     $.each($('input:radio:checked'),function(){source = $(this).val();});
    //     $.ajax({
    //         type: "GET",
    //         data: {  
    //             action: 'music_json_get',  
    //             form: 'admin-ajax.php',
    //             id: mid,
    //             type: type,
    //             source: source
    //         },
    //         beforeSend: function() {
    //             $('.json-data').html('正在解密歌曲信息请耐心等待 ...');
    //         },
    //         success: function(data) {
    //             if (data.length > 0) {
    //                 $('.json-data').html(data);
    //                 $('.sava-setting .mid').attr('value', mid);
    //                 $('.sava-setting .type').attr('value', type);
    //                 $('.sava-setting .source').attr('value', source);
    //             }
    //             else {
    //                 $('.json-data').html('没有找到歌曲数据，检查歌单ID和配置选项是否正确。');
    //             }
    //         }
    //     });

    //     return false;
    // });

    $('#deleteBgmData').on('click', function(e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            data: {
                action: 'music_data_delete',  
                form: 'admin-ajax.php',
            },
            beforeSend: function() {
                $('#deleteBgmData').val('正在回收数据库 ...');
            },
            success: function(data) {
                window.location.reload();
            }
        });
    });

    $('.setting #help-btn').on('click', function() {
        $('#music-help').show(200);
    });
    $('.setting #help-close').on('click', function() {
        $('#music-help').hide(200);
    });

    $.fn.extend({
        "insert":function(value){
            //默认参数
            value=$.extend({
                "text":"123"
            },value);

            var dthis = $(this)[0]; //将jQuery对象转换为DOM元素

            //IE下
            if(document.selection){
                $(dthis).focus();  //输入元素textara获取焦点
                var fus = document.selection.createRange();//获取光标位置
                fus.text = value.text;  //在光标位置插入值
                $(dthis).focus();   ///输入元素textara获取焦点
            }
            //火狐下标准
            else if(dthis.selectionStart || dthis.selectionStart == '0'){
                var start = dthis.selectionStart;
                var end = dthis.selectionEnd;
                var top = dthis.scrollTop;
                //以下这句，应该是在焦点之前，和焦点之后的位置，中间插入我们传入的值
                dthis.value = dthis.value.substring(0, start) + value.text + dthis.value.substring(end, dthis.value.length);
            }
            //在输入元素textara没有定位光标的情况  
            else{
                this.value += value.text;
                this.focus();
            };
            return $(this);
        }
    });
    function isNull( str ){
        if ( str == "" ) return true;
        var regu = "^[ ]+$";
        var re = new RegExp(regu);
        return re.test(str);
    }
    $('#inspire-create').on('click', function() {
        $('#insert-music').show(100);
    });
    $('#insert-data-close').on('click', function() {
        $('#insert-music').hide(20);
        $('.insert-music-content #text-input input').attr('value', '');
    });
    $('#insert-data').on('click', function() {
        var id = $('.insert-music-content #musicID').val(),
            title = $('.insert-music-content #musicTitle').val(),
            tags = $('.insert-music-content #musicTags').val(),
            cover = $('.insert-music-content #musicCover').val(),
            songNum = $('.insert-music-content #musicNum').val(),
            content = $('#post-body-content .wp-editor-area'),
            type, source;
        $.each($('.music-type input:radio:checked'),function(){type = $(this).val();});
        $.each($('.music-source input:radio:checked'),function(){source = $(this).val();});
        if(tags.length == 0 || isNull(tags)) {
            tags = '暂无';
        }
        if (id.length == 0 || isNull(id)) {
            alert("曲单ID不能为空");
        }
        else if(title.length == 0 || isNull(title)) {
            alert("曲单标题不能为空");
        }
        else if(cover.length == 0 || isNull(cover)) {
            alert("需要填写封面图片");
        }
        else if(songNum.length == 0 || isNull(songNum)) {
            alert("需要填写单曲数量");
        }
        else{
            var htm = '[mp3 id="'+id+'" type="'+type+'" source="'+source+'" title="'+title+'" tags="'+tags+'" cover="'+cover+'" num="'+songNum+'" ]';
            content.insert({"text":htm});
            $('.insert-music-content #text-input input').attr('value', '');
            $('#insert-music').hide(20);
        }
        
    });

    var musicCover_upload_frame;
    var value_id;
    $('#musicCover_upload').on('click',function(event) {
        value_id =$(this).attr('id');
        event.preventDefault();
        if( musicCover_upload_frame ){
            musicCover_upload_frame.open();
            return;
        }
        musicCover_upload_frame = wp.media({
            title: '添加封面',
            button: {
                text: '确认添加',
            },
            multiple: false
        });
        musicCover_upload_frame.on('select',function(){
            attachment = musicCover_upload_frame.state().get('selection').first().toJSON();
            $('input[name='+value_id+']').val(attachment.url);
        });
        
        musicCover_upload_frame.open();
    });

})