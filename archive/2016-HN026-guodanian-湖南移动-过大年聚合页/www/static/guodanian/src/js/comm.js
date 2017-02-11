/**
 * the common js of the project
 *
 * @author: xxxx
 * @version: 2016/10/27 10:51
 *           $Id$
 */
$(function () {
    var tabIndex = 0;
    $('.row_tab .tab').click(function () {
        $('.row_tab .tab').removeClass('active');
        $(this).addClass('active');
        tabIndex = $(this).index();
        $('.row_tab_con .tab_con').removeClass('active');
        $('.row_tab_con .tab_con').eq(tabIndex).addClass('active');
        return false;
    });

    var ruleInd, gInd, fanbeiInd, freeInd, shengdanInd, hbInd;

    $('.row_web .scale_rule').click(function () {
        ruleInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            shade: [0.6, '#000'],
            maxWidth: 0,
            resize: false,
            content: $('.popup_con.p_rule_con').html()
        });
        closePopup(ruleInd, 'rule');
        return false;
    });

    $('.row_web .bt_4g').click(function () {
        gInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            maxWidth: 0,
            resize: false,
            shade: [0.6, '#000'],
            content: $('.popup_con.p_scale_con_4g').html()
        });
        closePopup(gInd, '4g');
        return false;
    });

    $('.row_web .bt_fanbei').click(function () {
        if ($(this).hasClass('bt_disable')) {
            return;
        }
        fanbeiInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            maxWidth: 0,
            resize: false,
            shade: [0.6, '#000'],
            content: $('.popup_con.p_scale_con_fanbei').html()
        });
        closePopup(fanbeiInd, 'fanbei');
        return false;
    });

    $('.row_web .bt_free').click(function () {
        if ($(this).hasClass('bt_disable')) {
            return;
        }
        freeInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            maxWidth: 0,
            resize: false,
            shade: [0.6, '#000'],
            content: $('.popup_con.p_scale_con_free').html()
        });
        closePopup(freeInd, 'free');
        return false;
    });

    $('.bt_disable').click(function () {
        disableInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            maxWidth: 0,
            resize: false,
            shade: [0.6, '#000'],
            content: $('.popup_con.p_scale_con_disable').html()
        });
        closePopup(disableInd, 'disable');
        return false;
    });

    $('.row_web .bt_shengdan').click(function () {
        shengdanInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            maxWidth: 0,
            resize: false,
            shade: [0.6, '#000'],
            content: $('.popup_con.p_scale_con_shengdan').html()
        });
        closePopup(shengdanInd, 'shengdan');
        return false;
    });

    var hbArr = {
        // web
        'success': ['1g', 'qr', 'song', 'xiche', '10m', '100m', 'migu'],
        // wap
        // 'success': ['1g', 'fcm', 'song', 'xiche', '10m', '100m', 'migu', 'read'],
        'fail': ['huafei', 'tui', 'll20g', 'llbao', 'chai', 'over']
    };

    var hbGroup, hbTmpInd, hbType, hbLen;

    // 抽出的红包分组和红包索引值
    hbGroup = 'success';
    hbTmpInd = 0;
    hbLen = 6;

    hbType = hbArr[hbGroup][hbTmpInd];
    hbType = 'over';

    $('.bt_hongbao').click(function () {
        // 演示代码，可注释
        if (Math.random() > 0.5) {
            hbGroup = 'success';
            hbLen = 6;
        } else {
            hbGroup = 'fail';
            hbLen = 5;
        }
        hbTmpInd = Math.floor(Math.random() * hbLen);

        hbType = hbArr[hbGroup][hbTmpInd];
        console.log(hbGroup + '=>' + hbTmpInd + '==>' + hbType);
        // 演示代码结束

        hbInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            maxWidth: 0,
            resize: false,
            shade: [0.6, '#000'],
            content: $('.popup_con.p_hb_' + hbType).html()
        });
        closePopup(hbInd, hbType);
        return false;
    });

    var lingquInd;
    // 领取结果类型
    // suc | fail
    var lingquType = 'fail';
    $('.bt_lingqu').click(function () {
        lingquInd = layer.open({
            type: 1,
            title: false,
            closeBtn: 0, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            maxWidth: 0,
            resize: false,
            shade: [0.6, '#000'],
            content: $('.popup_con.p_lingqu_con_' + lingquType).html()
        });
        closePopup(lingquInd, 'lingqu_' + lingquType);
        return false;
    });

    function closePopup(ind, type) {
        $('.popup.p_' + type + ' .p_close').click(function () {
            layer.close(ind);
            return false;
        });
    }
});