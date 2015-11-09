# pagecreater
JS翻页组件

## 组件简介
pagecreater 是一个简单的js翻页代码生成组件，相较于其它js翻页组件，有以下几个特点：
- 组件默认采用自定义标签，随机生成dom id，并依据随机id创建css样式表，避免样式冲突。
- 不依赖于任何类库，支持amd模块化
- 使用自定义事件处理交互，默认会抛出三种自定义事件：CLICK_ITEM（点击任意元素）、CLICK_PAGE（点击翻页相关元素）、PAGE_CHANGE（翻页发生）
- 对dom使用requestAnimationFrame实现异步渲染（不支持raf的浏览器使用setTimeout降级）
- 通过自定义模板，可以简单实现元素组合，同时支持插入自定义的翻页元素

## 代码示例

基本调用方式
```javascript
PageCreater({option|Object});
```


```javascript
var page = PageCreater({
	max : 100
});
page.on('PAGE_CHANGE', function(ev) {
	console.log('共' + ev.max + '页，你从第' + (ev.from + 1) + '页翻到了第' + (ev.to + 1) + '页');
});
```

## option参数说明
```javascript
{
	text : { // 模板
		page : '{%pg%}', // 普通页，{%pg%}会在渲染时替换为页码数字
		current : '{%pg%}', // 当前页，{%pg%}会在渲染时替换为页码数字
		prev : '上一页', // 前页，{%pg%}会在渲染时替换为页码数字
		next : '下一页', // 后页，{%pg%}会在渲染时替换为页码数字
		first : '首页', // 第一页，{%pg%}会在渲染时替换为页码数字
		last : '末页', // 最后一页，{%pg%}会在渲染时替换为页码数字
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
	structure : '{%prev%}{%first%}{%page%}{%last%}{%next%}', // {%string%}会在渲染时替换为对应的元素或自定义元素
	wrap : document.body, // 页码插入的标签，必须是DOM元素，否则会抛出TypeError
	max : 0, // 最大页数，为0则不会渲染
	current : 0, // 当前页码，从0开始
	display : 3, // 当前页码前后显示几项
	pageTag : 'page', // 容器标签名称，建议使用自定义标签
	pageItemTag : 'pageitem', // 页码对象标签名称，建议使用自定义标签
	alwaysFirst : false, // 是否始终显示第一页
	alwaysLast : false, // 是否始终显示最后一页
	showEllipsis : false, // 是否显示省略号
	defaultCss : true // 是否使用组件提供的默认css样式
}
```

## PageCreater API说明

### {PageCreater}.on

监听自定义事件

### {PageCreater}.off

取消监听自定义事件

### {PageCreater}.trigger

抛出自定义事件

### {PageCreater}.destroy

销毁当前实例

## 事件说明

### CLICK_ITEM事件

点击任意元素均会抛出该事件。
```javascript
{
	type : 'click_item', // 事件类型
	target : {target|HTMLElement} // 点击的对象
}
```

### CLICK_PAGE事件

点击翻页相关元素会抛出该事件。
```javascript
{
	type : 'click_page', // 事件类型
	target : {target|HTMLElement} // 点击的对象
	page : {page|Integer} // 目标页码
}
```

### PAGE_CHANGE 事件

切换页码会抛出该事件。
```javascript
{
	type : 'page_change', // 事件类型
	from : {from_page|Integer}, // 来源页码
	to : {to_page|Integer}, // 目标页码
	max : {max_page|Integer} // 最大页数
}
```

## 使用自定义元素

使用自定义元素，要在option.text和option.className下均添加同名义项，并修改option.structure，添加{%义项名%}来引用。

代码示意：
```javascript
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
	max : 100
});
```
