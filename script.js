var Const = {
  row: 10,
	col: 10,
	num: 10,
	mine: [],
	pane: []
};

var Var = {
	mine: [],
	matrix: []
}

var Action = 
	layingMine: function() { // 埋雷
		while (Const.mine.length < Const.num) {
			var y = Math.floor(Math.random() * Const.row);
			var x = Math.floor(Math.random() * Const.col);
			(function() {
				for (var mine in Const.mine) {
					if (mine.y == y && mine.x == x) {
						return;
					}
				}
				Const.mine[Const.mine.length] = {y: y, x: x};
			})();
		}
	},
	drawMap = function() { // 初始化地图
		for (var i = 0; i < Const.row; i++) {
			Const.matrix[i] = [];
			for (var j = 0; j < Const.col; j++) {
				var tag = $('<div class="block fog" />');
				tag.attr('y', i);
				tag.attr('x', j);
				tag.attr('status', 'undo');
				tag.attr('num', calc(i, j));
				tag.mousedown(function(e) {
					Event.touch(e, $(this))
				});
				tag.appendTo('body');
				Const.matrix[i][j] = tag;
			}
			$('<div class="clear"/>').appendTo('body');
		}
	},
	calc = function(y, x) { // 计算周围地雷个数
		var num = 0;
		for (var mine in Const.mine) {
			if (y == mine.y && x == mine.x) {
				return -1;
			} 
			if (y >= mine.y - 1 && y <= mine.y + 1 && x >= mine.x - 1 && x <= mine.x + 1) {
				num++;
			}
		}
		return num;
	},
	explore: function(tag) { // 探索空地
		if (tag.attr('status') == 'undo' && tag.text() == '') {
			tag.removeClass('fog');
			tag.addClass('blank');
			tag.attr('status', 'do');
			switch(tag.attr('num')) {
				case '-1':
					for (var mine in Const.mine) {
						var temp = Const.pane[mine.y][mine.x];
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
								var temp = Const.pane[i][j];
								if (temp.attr('status') == 'undo') {
									explore(temp);
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
	exploreAround = function(tag) { // 探索周围
		var y = parseInt(tag.attr('y'))
		var x = parseInt(tag.attr('x'))
		var tags = []
		var num = 0
		for (var i = y - 1; i <= y + 1; i++) {
			for (var j = x - 1; j <= x + 1; j++) {
				if (i >= 0 && i < Const.row && j >= 0 && j < Const.col) {
					var temp = Const.pane[i][j];
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
			for (var temp in tags) {
				if (temp.attr('status') == 'undo') {
					explore(temp);
				}
			}
		}
	}
};

var Event = { // 事件
	touch: function(e, tag) { // 点击空地的事件
		switch (e.which) {
			case 1:
				if (tag.attr('status') == 'undo') {
					Action.explore(tag);
				} else {
					Action.exploreAround(tag);
				}
				break;
			case 3:
				if tag.attr('status') == 'undo' {
					Touch.flag(tag);
				}
				break;
		}
	},
	flag: function(tag) { // 插旗
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
	
$(function() {
	$('body').bind('contextmenu', function() {
		return false;
	});
	Action.layingMine();
	Action.drawMap();
});
