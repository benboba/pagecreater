# pagecreater
JS翻页组件

## 组件简介
pagecreater 是一个简单的js翻页代码生成组件，相较于其它js翻页组件，有以下几个特点：
- 组件默认采用自定义标签，随机生成dom id，并依据随机id创建css样式表，避免样式冲突。
- 不依赖于任何类库，可运行于amd模块化环境
- 使用自定义事件处理交互，默认会抛出三种自定义事件：CLICK_ITEM（点击任意元素）、CLICK_PAGE（点击翻页相关元素）、PAGE_CHANGE（翻页发生）
- 对dom使用requestAnimationFrame实现异步渲染
- 通过自定义模板，可以简单实现元素组合，同时支持插入自定义的翻页元素

## 使用示例
```javascript
var page = PageCreater({
	max : 100
});
page.on('PAGE_CHANGE', function(ev) {
	console.log('共' + ev.max + '页，你从第' + (ev.from + 1) + '页翻到了第' + (ev.to + 1) + '页');
});
```

## 参数说明

## 事件说明
