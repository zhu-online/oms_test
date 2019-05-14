/*
 |--------------------------------------------------------------------------
 | SkyCaiji (蓝天采集器)
 |--------------------------------------------------------------------------
 | Copyright (c) 2018 http://www.skycaiji.com All rights reserved.
 |--------------------------------------------------------------------------
 | 使用协议  http://www.skycaiji.com/licenses
 |--------------------------------------------------------------------------
 */
'use strict';$(document).ready(function(){toastr.options={"closeButton":!1,"debug":!1,"newestOnTop":!1,"progressBar":!1,"positionClass":"toast-top-center","preventDuplicates":!1,"onclick":null,"showDuration":"300","hideDuration":"1000","timeOut":"3000","extendedTimeOut":"1000","showEasing":"swing","hideEasing":"linear","showMethod":"fadeIn","hideMethod":"fadeOut"};$('body').on('submit','form[ajax-submit="true"]',function(){var $_o=$(this);$_o.find('button[type="submit"]').attr('disabled',!0);$.ajax({type:'POST',dataType:'json',url:$(this).attr('action'),data:$(this).serialize(),success:function(data){if(data.url){setTimeout("window.location.href='"+data.url+"';",2000)}else{$_o.find('button[type="submit"]').removeAttr('disabled')}
if(data.code==1){toastr.success(data.msg);$_o.find('.verify-img').trigger('click')}else{toastr.error(data.msg)}
if(data.data&&data.data.js){eval(data.data.js)}},error:function(data){$_o.find('button[type="submit"]').removeAttr('disabled');toastr.error(data)}});return!1})});function htmlspecialchars(str){str=str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');return str}
function setCookie(c_name,value,expiredays){var exdate=new Date();exdate.setDate(exdate.getDate()+expiredays);document.cookie=c_name+"="+escape(value)+((expiredays==null)?"":";expires="+exdate.toGMTString())+';path='+(window.site_config?(window.site_config.root?window.site_config.root:'/'):'/')}
function getCookie(c_name){if(document.cookie.length>0){var c_start=document.cookie.indexOf(c_name+"=");if(c_start!=-1){c_start=c_start+c_name.length+1;var c_end=document.cookie.indexOf(";",c_start);if(c_end==-1)c_end=document.cookie.length;return unescape(document.cookie.substring(c_start,c_end))}}
return""}
function isNull(str){var space=/^[\s\r\n]*$/;if(space.test(str)||str==null||str==''||!str)
return!0;else return!1}
function modal(title,body,options){if(!options){options={}}
if(document.getElementById('myModal')){$('#myModal').off();$('#myModal').modal('hide');$('#myModal').remove()}
if(!document.getElementById('myModal')){var modal='<div class="modal '+(options.lg?' bs-example-modal-lg':'')+' myModal" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog'+(options.lg?' modal-lg':'')+'"><div class="modal-content">'+'<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="font-size:24px;">&times;</button><h4 class="modal-title" id="myModalLabel"></h4></div><div class="modal-body" '+(options.bodyStyle?options.bodyStyle:'')+'></div>'+'<div class="modal-footer"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">'+tpl_lang.close+'</button></div></div></div></div>';$('body').append(modal)}
$('#myModal .modal-title').html(title);$('#myModal .modal-body').html(body);$('#myModal').modal('show')}
function htmlIsJson(html){if((/^\{(.+\:.+,*){1,}\}$/).test(html)){return!0}else{return!1}}
function windowModal(title,url,options){if(!options){options={}}
modal(title,'<img src="'+window.site_config.pub+'/static/images/loading.gif" />',options);var ajaxSet={type:'get',url:url,success:function(data){if(htmlIsJson(data)){$('#myModal').modal('hide');ajaxDataMsg(data)}else{modal(title,data,options)}},dataType:'html'};if(options.ajax){ajaxSet=$.extend(ajaxSet,options.ajax)}
var win_ajax_request=$.ajax(ajaxSet);$('#myModal').on('hidden.bs.modal',function(e){win_ajax_request.abort()})}
function windowIframe(title,url,options){if(!options){options={}}
options.bodyStyle=' style="padding:0;" ';modal(title,'<img src="'+window.site_config.pub+'/static/images/loading.gif" style="margin:10px;" />',options);var height=parseInt($(window).height());height=height-parseInt($('#myModal .modal-body').offset().top-$(document).scrollTop())*2;$('#myModal .modal-body').css('height',height);$('#myModal iframe').remove();$('#myModal .modal-body').html('<iframe id="myModalIframe" src="'+url+'" frameborder="0" width="100%" height="100%" frameborder="0" scrolling="yes"></iframe>');$('#myModal iframe').bind('load',function(){$('#myModal').attr('data-iframe-loaded',1)});$('#myModal').on('hidden.bs.modal',function(e){$('#myModal iframe').remove();if(options.close_func&&typeof(options.close_func)=='function'){options.close_func()}});if(options.loaded_func&&typeof(options.loaded_func)=='function'){options.loaded_func()}}
function ajaxDataMsg(data){if(typeof data=='string'){data=eval('('+data+')')}
if(data.code==1){toastr.success(data.msg)}else{toastr.error(data.msg)}
if(data.url){setTimeout("window.location.href='"+data.url+"';",2500)}}
function checkall(obj,chkName){var status=$(obj).is(":checked")?true:!1;$("input[name='"+chkName+"']:checkbox").prop('checked',status)}
function url_base64encode(str){str=Base64.encode(str);str=str.replace('+','-').replace('/','_').replace('=','');return str}
function generateUUID(){var d=new Date().getTime();var uuid='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=(d+Math.random()*16)%16|0;d=Math.floor(d/16);return(c=='x'?r:(r&0x7|0x8)).toString(16)});return uuid}
function refreshVerify(obj){var src=$(obj).attr('src');if(src.indexOf('version')>0){src=src.replace(/([\?\&]version\=)[\.\d]+/i,"$1"+Math.random())}else{src+=(src.indexOf('?')>-1?'&':'?')+'version='+Math.random()}
$(obj).attr('src',src)}
function ulink(url,vals){url=url.replace(/^\s*\//,'');if(url.indexOf('/')>-1){var path=url.split('/');if(path.length==2){url='admin/'+path[0]+'/'+path[1]}else if(path.length==3){url=path[0]+'/'+path[1]+'/'+path[2]}}
var newurl=window.site_config.root+'/';var curUrl=window.location.href.toLowerCase();if(curUrl.indexOf('/index.php?s=')>-1){newurl+='index.php?s=/';url=url.replace('?','&')}else if(curUrl.indexOf('/index.php')>-1){newurl+='index.php/'}
newurl+=url;if(vals){for(var i in vals){newurl=newurl.replace(i,encodeURIComponent(vals[i]))}}
return newurl}
function confirmRight(msg,func1,func2){bootbox.confirm({message:msg,buttons:{confirm:{label:'是',className:'btn-success'},cancel:{label:'否',className:'btn-danger'}},callback:function(result){if(result){func1()}else{if(func2){func2()}}}})}