/**
 * the common js lib
 *
 * @author: yunzhi li
 * @version: 2016/9/28 0:01
 *           $Id$
 */

$(function () {
    // menu
    var menuStatus = false;
    $('.aiui-menu > li').hover(function () {
        if ($(this).hasClass('active')) {
            menuStatus = true;
        }
        $(this).addClass('active');
    }, function () {
        if (!menuStatus) {
            $(this).removeClass('active');
        } else {
            menuStatus = false;
        }
    });

    // banner
    $('.row_banner .swiper-container').swiper({
        speed: 750,
        mode: 'horizontal',
        loop: true,
        pagination: '.pagination',
        paginationClickable: true,
        autoplay: 2000
    });

    // 当超低版本浏览器时，需要启用该JS
    // $('.duihuan-box').hover(function () {
    //     $(this).addClass('active');
    // }, function () {
    //     $(this).removeClass('active');
    // });
});


