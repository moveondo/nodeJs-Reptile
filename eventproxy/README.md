### eventproxy

异步抓取链接页面的数据研究了两天，终于找了。先看结果：

![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/proxy.png)

链家的数据部分是在链接详情页面的，如是否随时看房，具体地址，大小和价格（是否季付）等。

所有在主页面抓取数据后，详情页面的数据进行异步抓取后不能及时返回。查询良久，现发现使用eventproxy；

```
var ep = new eventproxy();
  
houses.forEach(function (house) {
    superagent.get(house["href"])
      .end(function (err, res) {
        //console.log('fetch ' + topicUrl["Visits"] + ' successful');
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








