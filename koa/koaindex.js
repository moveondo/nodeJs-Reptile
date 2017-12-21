// const path = require('path');
// const serve = require('koa-static');
//
// const main = serve(path.join(__dirname));
const http = require ('http');
const fs = require('fs.promised');
const async = require('async');
// const eventproxy = require('eventproxy');
// const superagent = require('superagent');
//
const cheerio = require('cheerio');
const render = require('koa-ejs');
require('babel-register');
// require("./templating.js");
const koaBody = require('koa-body');
const route = require('koa-route');
var querystring = require('querystring');
const koa=require('koa');
 const ejs = require('ejs');



var app= new koa();
app.use(koaBody());

// app.use(templating('views', {
//     noCache: !isProduction,
//     watch: !isProduction
// }));



// const main = ctx => {
//   if (ctx.request.path !== '/') {
//     ctx.response.type = 'html';
//     ctx.response.body = '<a href="/">Index Page</a>';
//   } else {
//     ctx.response.type = 'html';
//     ctx.response.body = fs.createReadStream('./koa_index.ejs');
//   }
//
// };
//
const main = async function (ctx, next) {

  ctx.response.type = 'html';
  ctx.response.body = await  fs.readFile('./koa_index.ejs', 'utf8');
  //  ctx.response.body = await  ctx.render('./koa_index.ejs');
};




// route.get('/',function *(ctx,next){
//     ctx.render('koa_index.esj');
// });
const  about= async  ctx => {
  ctx.response.body = 'Hello World';
};

// app.use(async ctx => {
//   ctx.body = 'Hello World';
// });



// const main = ctx => {
//   if (ctx.request.accepts('xml')) {
//     ctx.response.type = 'xml';
//     ctx.response.body = '<data>Hello World</data>';
//   } else if (ctx.request.accepts('json')) {
//     ctx.response.type = 'json';
//     ctx.response.body = { data: 'Hello World' };
//   } else if (ctx.request.accepts('html')) {
//     ctx.response.type = 'html';
//     ctx.response.body = '<p>Hello World</p>';
//   } else {
//     ctx.response.type = 'text';
//     ctx.response.body = 'Hello World';
//   }
// };



const  getHouseText= async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`); // 打印URL
      console.log(ctx.query.page);//get
      var page ="d"+ctx.query.page;  //获取get请求中的参数 page
      console.log("page: "+page);

      var Res = ctx.res;  //保存，防止下边的修改
      //url 获取信息的页面部分地址
      //var url = 'http://sh.lianjia.com/ershoufang/pudong';
      var url = 'http://sh.lianjia.com/ershoufang/';
      //var url='http://sh.lianjia.com/ershoufang/?utm_source=baidu&utm_medium=pinzhuan&utm_content=Title&utm_campaign=Main';

      http.get(url+page,function(res){  //通过get方法获取对应地址中的页面信息
          var chunks = [];
          var size = 0;
          res.on('data',function(chunk){   //监听事件 传输
              chunks.push(chunk);
              size += chunk.length;
          });
          res.on('end',function(){  //数据传输完
              var data = Buffer.concat(chunks,size);
              var html = data.toString();
              //console.log(html);
              var $ = cheerio.load(html); //cheerio模块开始处理 DOM处理
              var jobs = [];

      				var jobs_list = $(".js_fang_list li");


              $(".js_fang_list>li").each(function(){   //对页面岗位栏信息进行处理  每个岗位对应一个 li  ,各标识符到页面进行分析得出
                  var job = {};
                  //job.company = $(this).find(".info-table span").eq(1).find("a").html(); //公司名
      						job.propTitle = $(this).find(".prop-title a").attr("title"); //岗位链接
                  job.louceng = $(this).find(".info-row span").eq(0).html().replace('svg',"").replace('<',"").replace('>',""); //楼层
                  job.totalPrice = $(this).find(".info-row span").eq(1).html(); //金额
                  job.unit = $(this).find(".info-row span").eq(2).html(); //单价

                   job.city0 = $(this).find(".row2-text a").eq(0).html(); //楼盘
      						 job.city1 = $(this).find(".row2-text a").eq(1).html(); //地点1
      						job.city2 = $(this).find(".row2-text a").eq(2).html(); //地点2
                  job.salary = $(this).find(".info-col.price-item.minor").html(); //单价
                   job.juli = $(this).find(".property-tag-container span").eq(0).html(); //距离
                   job.wu = $(this).find(".property-tag-container span").eq(1).html(); //满五
      						 job.yaoshi = $(this).find(".property-tag-container span").eq(2).html(); //有误钥匙


                  jobs.push(job);
              });
              // Res.json({  //返回json格式数据给浏览器端
              //     jobs:jobs
              // });
                //ctx.response.body
                 ctx.response.body=jobs;
      				   console.log(ctx.body);  //控制台输出岗位名
          });
      });
};

 app.use(route.get('/', main));
app.use(route.get('/about', about));
app.use(route.get('/getHouse', main));

app.listen(8000);

app.on('error', function(err,ctx){
	console.log(err);
});
