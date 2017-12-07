const http = require ('http');
const qs = require("querystring");
const url = require("url");
const fs =require('fs');
const mysql = require('mysql');
var cheerio = require('cheerio');

const nodeExcel=require('excel-export');


// const staticFiles = require('./static');

const express=require('express');
const multer=require('multer')({dest: './static/upload'});
const pathLib=require('path');
const bodyParser= require('body-parser');

const ejs = require('ejs');


var app=express();
app.listen(8087);
app.use(multer.any());
// app.use(staticFiles('/www/', __dirname + '/www'));

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.engine('html', ejs.renderFile);
app.set("view engine", "html");

app.get('/', (req, res)=>{
	res.writeHead(200,{"Content-Type":"text/html"});
	fs.readFile("./node.ejs","utf-8",function(e,data){
			res.write(data);
			res.end();
	 });
});

//租房
// app.get('/getJobs', function(req, res, next) { // 浏览器端发来get请求
// //var page ="d"+req.query.page;  //获取get请求中的参数 page 买房
// 	 var page="d"+req.query.page+"s22";
// 	console.log("page: "+page);
//
// 	var Res = res;  //保存，防止下边的修改
// 	//url 获取信息的页面部分地址
// 	//var url = 'http://sh.lianjia.com/ershoufang/pudong';
// 	//var url = 'http://sh.lianjia.com/ershoufang/';
// 	//var url='http://sh.lianjia.com/ershoufang/?utm_source=baidu&utm_medium=pinzhuan&utm_content=Title&utm_campaign=Main';
//
// 	var url='http://sh.lianjia.com/zufang/zhangjiang/';//浦东张江租房
// 	console.log(url+page);
// 	http.get(url+page,function(res){  //通过get方法获取对应地址中的页面信息
// 	    var chunks = [];
// 	    var size = 0;
// 	    res.on('data',function(chunk){   //监听事件 传输
// 	        chunks.push(chunk);
// 	        size += chunk.length;
// 	    });
// 	    res.on('end',function(){  //数据传输完
// 	        var data = Buffer.concat(chunks,size);
// 	        var html = data.toString();
// 	        //console.log(html);
// 	        var $ = cheerio.load(html); //cheerio模块开始处理 DOM处理
// 	        var jobs = [];
//
// 					var jobs_list = $("#house-lst li");
//
// 	        $("#house-lst>li").each(function(){   //对页面岗位栏信息进行处理  每个岗位对应一个 li  ,各标识符到页面进行分析得出
// 	            var job = {};
//
// 	            //job.company = $(this).find(".info-table span").eq(1).find("a").html(); //公司名
// 							//job.ziru = $(this).find(".pic-panel a .label_ziru").html(""); //自如
// 							job.propTitle = $(this).find(".info-panel h2 a").attr("title"); //标题
// 	            job.louceng0 = $(this).find(".col-1 .where a span").eq(0).html(); //地点大小
// 							job.louceng1 = $(this).find(".col-1 .where span").eq(1).html(); //地点大小
// 							job.louceng2 = $(this).find(".col-1 .where span").eq(2).html(); //地点大小
// 	            job.Other = $(this).find(".other .con a").eq(0).html(); //其他信息
// 	            job.Other1 = $(this).find(".other .con a").eq(1).html(); //其他信息
// 							job.Other2 = $(this).find(".other .con").html(); //其他信息
// 	             job.price = $(this).find(".col-3 .price .num").html(); //单价
// 							 job.pricePre = $(this).find(".price-pre").html(); //上架时间
// 							job.see = $(this).find(".col-2 .square .num").html(); //多少人看过此房
//
// 	            jobs.push(job);
//
// 	        });
//
// 	        Res.json({  //返回json格式数据给浏览器端
// 	            jobs:jobs
// 	        });
// 					  
// 	    });
// 	});
//
// });

//买房
app.get('/getJobs', function(req, res, next) { // 浏览器端发来get请求
var page ="d"+req.query.page;  //获取get请求中的参数 page
console.log("page: "+page);

var Res = res;  //保存，防止下边的修改
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
						 job.yaoshi = $(this).find(".property-tag-container span").eq(2).html(); //有钥匙


            jobs.push(job);
        });
        Res.json({  //返回json格式数据给浏览器端
            jobs:jobs
        });
				  console.log(jobs.length);  
    });
});

});
