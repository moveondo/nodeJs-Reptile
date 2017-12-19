### 《使用 eventproxy 控制并发》

前面我们介绍了如何使用 superagent 和 cheerio 来取主页内容，那只需要发起一次 http get 请求就能办到。但这次，我们需要取出详情页的数据，这就要求我们对每个详情页的链接发起请求，并用 cheerio 去取出其中的数据。


异步抓取链接页面的数据研究了两天，终于找了。先看结果：

![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/proxy.png)

链家的数据部分是在链接详情页面的，如是否随时看房，具体地址，大小和价格（是否季付）等。

所有在主页面抓取数据后，详情页面的数据进行异步抓取后不能及时返回。查询良久，现发现使用eventproxy；

首先看下主干代码

```
var ep = new eventproxy();
  
houses.forEach(function (house) {
    superagent.get(house["href"])
      .end(function (err, res) {
        ep.emit('href_html', [house["href"],...,res.text]);
      });
  });
      
```
发射后

```
ep.after('href_html', houses.length, function (house) {
    console.log("length:"+houses.length);

    housesMany = house.map(function (house) {				
      .....
      var $ = cheerio.load(topicHtml);
      return ({
        href:href,
        ......
        AddrEllipsis : $($('.cj-cun .aroundInfo .addrEllipsis')).text().replace(/^\s+/g,""),//地点
      });
    });
        
```

所有原数据及详情页面的数据在查询完成后进行返回。达到索要效果。

输出长这样：

![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/proxy1.png)


## 关于eventproxy：

#### 多类型异步协作

此处以页面渲染为场景，渲染页面需要模板、数据。假设都需要异步读取
```
var ep = new EventProxy();
ep.all('tpl', 'data', function (tpl, data) {
  // 在所有指定的事件触发后，将会被调用执行
  // 参数对应各自的事件名
});
fs.readFile('template.tpl', 'utf-8', function (err, content) {
  ep.emit('tpl', content);
});
db.get('some sql', function (err, result) {
  ep.emit('data', result);
});

```
all方法将handler注册到事件组合上。当注册的多个事件都触发后，将会调用handler执行，每个事件传递的数据，将会依照事件名顺序，传入handler作为参数。

#### 快速创建

EventProxy提供了create静态方法，可以快速完成注册all事件。
```
var ep = EventProxy.create('tpl', 'data', function (tpl, data) {
  // TODO
});
```
以上方法等效于

```
var ep = new EventProxy();
ep.all('tpl', 'data', function (tpl, data) {
  // TODO
});

```

#### 重复异步协作

after方法适合重复的操作，比如读取10个文件，调用5次数据库等。将handler注册到N次相同事件的触发上。达到指定的触发数，handler将会被调用执行，每次触发的数据，将会按触发顺序，存为数组作为参数传入。

```
var ep = new EventProxy();
ep.after('got_file', files.length, function (list) {
  // 在所有文件的异步执行结束后将被执行
  // 所有文件的内容都存在list数组中
});
for (var i = 0; i < files.length; i++) {
  fs.readFile(files[i], 'utf-8', function (err, content) {
    // 触发结果事件
    ep.emit('got_file', content);
  });
}
```

### 持续型异步协作

此处以股票为例，数据和模板都是异步获取，但是数据会持续刷新，视图会需要重新刷新。

```
var ep = new EventProxy();
ep.tail('tpl', 'data', function (tpl, data) {
  // 在所有指定的事件触发后，将会被调用执行
  // 参数对应各自的事件名的最新数据
});
fs.readFile('template.tpl', 'utf-8', function (err, content) {
  ep.emit('tpl', content);
});
setInterval(function () {
  db.get('some sql', function (err, result) {
    ep.emit('data', result);
  });
}, 2000);
```
tail与all方法比较类似，都是注册到事件组合上。不同在于，指定事件都触发之后，如果事件依旧持续触发，将会在每次触发时调用handler，极像一条尾巴。


















参考：http://eventproxy.html5ify.com/









