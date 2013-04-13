var Const = {
    row:10,
    col:10,
    num:10
};

var Var = {
    mine:[],
    matrix:[]
};

var Action = {
    /**
     * 埋雷
     */
    layingMine:function () {
        while (Var.mine.length < Const.num) {
            var y = Math.floor(Math.random() * Const.row);
            var x = Math.floor(Math.random() * Const.col);
            (function () {
                for (var i = 0; i < Var.mine.length; i++) {
                    var mine = Var.mine[i];
                    if (mine.y == y && mine.x == x) {
                        return;
                    }
                }
                Var.mine.push({y:y, x:x});
            })();
        }
    },
    /**
     * 初始化地图
     */
    drawMap:function () {
        for (var i = 0; i < Const.row; i++) {
            Var.matrix[i] = [];
            for (var j = 0; j < Const.col; j++) {
                var tag = $('<div class="block fog" />');
                tag.attr('y', i);
                tag.attr('x', j);
                tag.attr('status', 'undo');
                tag.attr('num', Action.calc(i, j));
                tag.mousedown(function (e) {
                    Event.touch(e, $(this))
                });
                tag.appendTo($('body'));
                Var.matrix[i][j] = tag;
            }
            $('<div class="clear"/>').appendTo('body');
        }
    },
    /**
     * 计算周围地雷个数
     * @param y 中心的横坐标
     * @param x 中心的纵坐标
     * @return {Number} 地雷个数
     */
    calc:function (y, x) {
        var num = 0;
        for (var i = 0; i < Var.mine.length; i++) {
            var mine = Var.mine[i];
            if (y == mine.y && x == mine.x) {
                return -1;
            }
            if (y >= mine.y - 1 && y <= mine.y + 1 && x >= mine.x - 1 && x <= mine.x + 1) {
                num++;
            }
        }
        return num;
    },
    /**
     * 探索空地
     * @param tag
     */
    explore:function (tag) {
        if (tag.attr('status') == 'undo' && tag.text() == '') {
            tag.removeClass('fog');
            tag.addClass('blank');
            tag.attr('status', 'do');
            switch (tag.attr('num')) {
                case '-1':
                    for (var i = 0; i < Var.mine.length; i++) {
                        var mine = Var.mine[i];
                        var temp = Var.matrix[mine.y][mine.x];
                        temp.removeClass('fog');
                        temp.addClass('blank');
                        temp.text('*');
                    }
                    break;
                case '0':
                    tag.text('');
                    var y = parseInt(tag.attr('y'));
                    var x = parseInt(tag.attr('x'));
                    for (var i = y - 1; i <= y + 1; i++) {
                        for (var j = x - 1; j <= x + 1; j++) {
                            if (i >= 0 && i < Const.row && j >= 0 && j < Const.col) {
                                var temp = Var.matrix[i][j];
                                if (temp.attr('status') == 'undo') {
                                    Action.explore(temp);
                                }
                            }
                        }
                    }
                    break;
                default:
                    tag.text(tag.attr('num'));
                    break;
            }
        }
    },
    exploreAround:function (tag) { // 探索周围
        var y = parseInt(tag.attr('y'));
        var x = parseInt(tag.attr('x'));
        var tags = [];
        var num = 0;
        for (var i = y - 1; i <= y + 1; i++) {
            for (var j = x - 1; j <= x + 1; j++) {
                if (i >= 0 && i < Const.row && j >= 0 && j < Const.col) {
                    var temp = Var.matrix[i][j];
                    if (temp.attr('status') == 'undo') {
                        if (temp.text() == '') {
                            tags[tags.length] = temp;
                        } else {
                            num++;
                        }
                    }
                }
            }
        }
        if (num >= parseInt(tag.attr('num'))) {
            for (var i = 0; i < tags.length; i++) {
                Action.explore(tags[i]);
            }
        }
    }
};

var Event = { // 事件
    touch:function (e, tag) { // 点击空地的事件
        switch (e.which) {
            case 1:
                if (tag.attr('status') == 'undo') {
                    Action.explore(tag);
                } else {
                    Action.exploreAround(tag);
                }
                break;
            case 3:
                if (tag.attr('status') == 'undo') {
                    Event.flag(tag);
                }
                break;
        }
    },
    flag:function (tag) { // 插旗
        switch (tag.text()) {
            case '':
                tag.text('¶');
                break;
            case '¶':
                tag.text('?');
                break;
            case '?':
                tag.text('');
                break;
        }
    }
};

$(function () {
    $('body').bind('contextmenu', function () {
        return false;
    });
    Action.layingMine();
    Action.drawMap();
});
