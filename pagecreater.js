/*
 * 页码生成器
 * @authro WangFeng
 * @version 1.0.0
 *
 * ======================================
 *
 * 调用示例：
var page = PageCreater({
	text : {
		prev : '上一页[第{%pg%}页]',
		next : '下一页[第{%pg%}页]',
		testBefore : '测试{',
		testAfter : '}测试',
	},
	className : {
		testBefore : 'test_before',
		testAfter : 'test_after'
	},
	structure : '{%testBefore%}{%prev%}{%page%}{%next%}{%testAfter%}',
	max : 100,
	current : 49,
	display : 5
});
page.on('PAGE_CHANGE', function(ev) {
	console.log('共' + ev.max + '页，你从第' + (ev.from + 1) + '页翻到了第' + (ev.to + 1) + '页');
});
 */

(function(window) {
	var baseOption = {
		text : { // 模板
			page : '{%pg%}',
			current : '{%pg%}',
			prev : '上一页', // 前页
			next : '下一页', // 后页
			first : '首页', // 第一页
			last : '末页', // 最后一页
			ellipsis : '...' // 省略号
		},
		className : { // 样式名
			page : 'pagecreater_page', // 普通页
			current : 'pagecreater_current', // 当前页
			prev : 'pagecreater_prev', // 前页
			next : 'pagecreater_next', // 后页
			first : 'pagecreater_first', // 第一页
			last : 'pagecreater_last', // 最后一页
			ellipsis : 'pagecreater_ellipsis', // 省略号
			disable : 'pagecreater_disable' // 不可点
		},
		structure : '{%prev%}{%first%}{%page%}{%last%}{%next%}', // 结构模板
		wrap : document.body, // 插入到哪个容器
		max : 0, // 最大有多少页
		current : 0, // 当前默认在第几页
		display : 3, // 当前页码前后各展示多少页
		pageTag : 'page', // 容器标签，建议使用自定义标签
		pageItemTag : 'pageitem', // 页码对象标签，建议使用自定义标签
		alwaysFirst : false, // 始终显示第一页
		alwaysLast : false, // 始终显示最后一页
		showEllipsis : false, // 是否显示省略号
		defaultCss : true // 使用组件提供的默认css样式
	},
	// 事件缓存
	EvObj = {},
	raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(fn) {
		return setTimeout(fn, 50 / 3);
	},
	// 简单处理对象合并
	extend = function() {
		var obj = {};
		for (var i = 0, l = arguments.length; i < l; i++) {
			if (typeof arguments[i] === 'object') {
				for (var j in arguments[i]) {
					if (arguments[i].hasOwnProperty(j)) {
						if (Object.prototype.toString.call(arguments[i][j]) === '[object Object]') {
							obj[j] = extend(obj[j], arguments[i][j]);
						} else {
							obj[j] = arguments[i][j];
						}
					}
				}
			}
		}
		return obj;
	};
	
	var PageCreater = function(option) {
		// 必须实例化
		if (!(this instanceof PageCreater)) {
			return new PageCreater(option);
		}
		
		this.option = extend(baseOption, option);
		
		if (!this.option.wrap.nodeType || this.option.wrap.nodeType !== 1) {
			throw(new TypeError('option.wrap 必须是HTML标签！'));
		}
		
		if (typeof this.option.pageTag !== 'string') {
			throw(new TypeError('option.pageTag 必须是字符串！'));
		}
		if (!this.option.pageTag || !/[a-z]+/i.test(this.option.pageTag)) {
			throw(new TypeError('option.pageTag 必须是纯字母！'));
		}
		
		if (typeof this.option.pageItemTag !== 'string') {
			throw(new TypeError('option.pageItemTag 必须是字符串！'));
		}
		if (!this.option.pageItemTag || !/[a-z]+/i.test(this.option.pageItemTag)) {
			throw(new TypeError('option.pageItemTag 必须是纯字母！'));
		}
		
		var date = +new Date();
		this.option.id = 'pagecreater_' + date + '_' + ('' + Math.random()).substr(2);
		
		// 将页码格式化
		this.option.max = parseInt(this.option.max) || 0;
		this.option.display = parseInt(this.option.display) || 0;
		this.option.current = parseInt(this.option.current) || 0;
		this.option.current = Math.max(Math.min(this.option.current, this.option.max - 1), 0);
			
		this.createElement();
		if (this.option.defaultCss) {
			this.createCss();
		}
		this.create();
	};
	PageCreater.prototype = {
		constructor : PageCreater,
		/*
		 * 创建page对象及自定义标签，点击事件代理
		 */
		createElement : function() {
			this.page = document.createElement(this.option.pageTag);
			this.page.id = this.option.id;
			this.option.wrap.appendChild(this.page);
			
			var self = this;
			this.clickEvent = function(ev) {
				var target = ev.target, current = self.option.current, max = self.option.max, from = current;
				while (target !== this && target.tagName !== self.option.pageItemTag.toUpperCase()) {
					target = target.parentNode;
				}
				if (target === this) {
					return;
				}
				
				if (target.dataset.click === 'page') {
					current = parseInt(target.dataset.pg) || 0;
					current = Math.max(Math.min(current, max - 1), 0);
					
					if (from !== current) {
						self.option.current = current;
						self.create(true, from);
					}
					self.trigger('CLICK_PAGE', {
						type : 'click_page',
						target : target,
						page : current
					});
				}
				self.trigger('CLICK_ITEM', {
					type : 'click_item',
					target : target
				});
				
				ev.preventDefault();
				ev.stopPropagation();
			};
			this.page.addEventListener('click', this.clickEvent);
			this.page.setAttribute('onselectstart', 'return false;');
			
			document.createElement(this.option.pageItemTag);
		},
		/*
		 * 创建默认样式
		 */
		createCss : function() {
			var option = this.option, style = [
				'#{%id%}{',
					'color:#666;',
					'display:block;',
					'font-size:14px;',
					'margin:9px 0;',
					'padding:9px 0;',
					'text-align:center;',
				'}',
				'#{%id%} {%pageItemTag%}{',
					'background:#fff;',
					'border:1px solid #ccc;',
					'border-radius:2px;',
					'cursor:pointer;',
					'display:inline-block;',
					'height:24px;',
					'line-height:24px;',
					'padding:0 9px;',
					'vertical-align:middle;',
				'}',
				'#{%id%} {%pageItemTag%}+{%pageItemTag%}{',
					'margin-left:6px;',
				'}',
				'#{%id%} {%pageItemTag%}:hover{',
					'background:#eee;',
					'color:#333;',
				'}',
				'#{%id%} .{%currentClass%},#{%id%} .{%currentClass%}:hover{',
					'background:#f93;',
					'border:1px solid #c60;',
					'color:#fff;',
				'}',
				'#{%id%} .{%ellipsisClass%},#{%id%} .{%ellipsisClass%}:hover{',
					'background:transparent;',
					'border:none;',
					'color:#ccc;',
					'padding:0;',
				'}',
				'#{%id%} .{%disableClass%},#{%id%} .{%disableClass%}:hover{',
					'background:#ddd;',
					'color:#999;',
					'text-shadow:0 1px 1px #fff;',
				'}',
			].join('');
			
			style = style.replace(/{%\s*(.+?)\s*%}/g, function(match, str) {
				switch (str) {
					case 'id':
						return option.id;
					case 'pageItemTag':
						return option.pageItemTag;
					case 'currentClass':
						return option.className.current;
					case 'ellipsisClass':
						return option.className.ellipsis;
					case 'disableClass':
						return option.className.disable;
				}
			});
			
			this.page_style = document.createElement('style');
			this.page_style.innerHTML = style;
			document.body.appendChild(this.page_style);
		},
		/*
		 * 创建HTML内容
		 */
		create : function(pageChange, frompage) {
			if (!this.option.max) return;
			
			var self = this;
			raf(function() { // 异步执行
				var element = document.createElement(self.option.pageTag);
				
				self.page.innerHTML = self.option.structure.replace(/{%\s*(.+?)\s*%}/g, function(match, str) {
					var result = [], current = self.option.current, max = self.option.max, display = self.option.display, pg, className;
					if (self.option.className[str] && self.option.text[str]) {
						if (str === 'page') {
							if (current - display > 0) {
								if (self.option.alwaysFirst) {
									result.push('<', self.option.pageItemTag, ' class="', self.option.className.page, '" data-click="page" data-pg="0">', self.option.text.page.replace(/{%\s*pg\s*%}/g, 1), '</', self.option.pageItemTag, '>');
								}
								if (self.option.showEllipsis && current - display > 1) {
									result.push('<', self.option.pageItemTag, ' class="', self.option.className.ellipsis, '">', self.option.text.ellipsis, '</', self.option.pageItemTag, '>');
								}
							}
							for (var i = Math.max(0, current - display), l = Math.min(current + display, max - 1); i <= l; i++) {
								className = (i === current) ? self.option.className.current : self.option.className.page;
								result.push('<', self.option.pageItemTag, ' class="', className, '" data-click="page" data-pg="', i, '">', self.option.text.page.replace(/{%\s*pg\s*%}/g, i + 1), '</', self.option.pageItemTag, '>');
							}
							if (current + display < max - 1) {
								if (self.option.showEllipsis && current + display < max - 2) {
									result.push('<', self.option.pageItemTag, ' class="', self.option.className.ellipsis, '">', self.option.text.ellipsis, '</', self.option.pageItemTag, '>');
								}
								if (self.option.alwaysLast) {
									result.push('<', self.option.pageItemTag, ' class="', self.option.className.page, '" data-click="page" data-pg="', max - 1, '">', self.option.text.page.replace(/{%\s*pg\s*%}/g, max), '</', self.option.pageItemTag, '>');
								}
							}
						} else {
							className = self.option.className[str];
							switch (str) {
								case 'first':
									pg = 0;
									break;
								case 'last':
									pg = max - 1;
									break;
								case 'prev':
									pg = Math.max(current - 1, 0);
									break;
								case 'next':
									pg = Math.min(current + 1, max - 1);
									break;
								default:
									pg = null;
									break;
							}
							if (current === pg) {
								className += ' ' + self.option.className.disable;
							}
							result.push('<', self.option.pageItemTag, ' class="', className, '"');
							if (pg !== null) {
								result.push(' data-click="page" data-pg="', pg, '"');
							}
							result.push('>');
							if (pg !== null) {
								result.push(self.option.text[str].replace(/{%\s*pg\s*%}/g, pg + 1));
							} else {
								result.push(self.option.text[str]);
							}
							result.push('</', self.option.pageItemTag, '>');
						}
					}
					return result.join('');
				});
				
				if (pageChange) { // 如果是切换页面，则抛出自定义事件
					self.trigger('PAGE_CHANGE', {
						type : 'page_change',
						to : self.option.current,
						max : self.option.max,
						from : frompage
					});
				}
			});
		},
		/*
		 * 绑定事件
		 * @param {String} 事件类型，不区分大小写
		 * @param {Function} 事件回调
		 * [@param] {Boolean} 是否优先执行
		 */
		on : function(eventname, callback, delay) {
			if ( typeof eventname === 'string' && callback) {
				// 事件类型强制转为大写
				eventname = eventname.toUpperCase();
				
				if (!EvObj[eventname]) {
					EvObj[eventname] = [];
				}
				
				var operate = delay ? 'unshift' : 'push';

				if ( typeof callback === 'function') {
					EvObj[eventname][operate](callback);
				} else if (Object.prototype.toString.call(callback) === '[object Array]') {
					for (var ei = 0, el = callback.length; ei < el; ei++) {
						if ( typeof callback[ei] === 'function') {
							EvObj[eventname][operate](callback[ei]);
						}
					}
				}
			}
			return this;
		},
		/*
		 * 解除绑定事件
		 * [@param] {String} 事件类型，不区分大小写
		 * [@param] {Function} 事件回调
		 */
		off : function(eventname, callback) {
			if ( typeof eventname === 'string') {
				// 事件类型强制转为大写
				eventname = eventname.toUpperCase();
				
				// 第一个参数必须是事件类型字符串
				if (EvObj[eventname] && EvObj[eventname].length) {
					if (callback && typeof callback === 'function') {
						for (var ei = EvObj[eventname].length; ei--; ) {
							var fn = EvObj[eventname][ei];
							if (fn === callback || fn.toString() === callback.toString()) {
								EvObj[eventname].splice(ei, 1);
								// 不中断循环，避免有重复绑定同一个方法的情况
								// break;
							}
						}
					} else {
						EvObj[eventname] = null;
						delete EvObj[eventname];
					}
				}
			} else {
				// 第一个参数无效，直接清空所有事件监听
				for (var e in EvObj) {
					this.removeEventListener(e);
				}
			}
			return this;
		},
		/*
		 * 抛出事件
		 * @param {String} 事件类型
		 * [@param ...] {Mix} 需要传递的参数
		 */
		trigger : function(eventname) {
			if ( typeof eventname === 'string') {
				if (EvObj[eventname] && EvObj[eventname].length) {
					var args = Array.prototype.slice.call(arguments, 1);
					for (var ei = EvObj[eventname].length; ei--; ) {
						if (typeof EvObj[eventname][ei] === 'function') {
							EvObj[eventname][ei].apply(this, args);
						} else {
							EvObj[eventname].splice(ei, 1);
						}
					}
				}
			}
			return this;
		},
		/*
		 * 销毁组件
		 */
		destroy : function() {
			this.page.removeEventListener('click', this.clickEvent);
			this.option.wrap.removeChild(this.page);
			this.page_style && document.body.removeChild(this.page_style);
		}
	};

	if ( typeof window.define === 'function' && define.amd) {
		define('pagecreater', [], function() {
			return PageCreater;
		});
	} else {
		window.PageCreater = PageCreater;
	}

})(window);
