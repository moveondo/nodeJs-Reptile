const http = require ('http');
const qs = require("querystring");
const url = require("url");
const fs =require('fs');
const mysql = require('mysql');
const async = require('async');
const eventproxy = require('eventproxy');
const superagent = require('superagent');

var cheerio = require('cheerio');

const nodeExcel=require('excel-export');


// const staticFiles = require('./static');

const express=require('express');
const multer=require('multer')({dest: './static/upload'});
const pathLib=require('path');
const bodyParser= require('body-parser');

const ejs = require('ejs');

//mysql ���ݿ�������Ϣ
var config = {
	host:"127.0.0.1",
	user:"root",
	password:'123456'
}

//����db��function
function connectMysql(){

	var mydb;
	mydb = mysql.createConnection(config);
	mydb.connect(handleError);
	mydb.on('error',handleError);

	return mydb;
}


//db���Ӵ���ʱ�Ĵ���
function handleError(err){

	if(err){
		//���������ӶϿ�,�Զ���������
		if(err.code === 'PROTOCOL_CONNECTION_LOST'){
			connectMysql();
		}else{
			console.log(err.stack || err);
		}
	}
}

var app=express();
app.listen(8087);
app.use(multer.any());//�����ļ�ͼƬ
// app.use(staticFiles('/www/', __dirname + '/www'));

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.engine('html', ejs.renderFile);
app.set("view engine", "html");

app.get('/', (req, res)=>{
	res.writeHead(200,{"Content-Type":"text/html"});
	fs.readFile("./node1.ejs","utf-8",function(e,data){
		  	res.write('node1.ejs',{title:"最近文章"});
			res.write(data);
			res.end();
	 });
});

function getPageAsync(url) {//使用Promise对象来包装获取到页面的html的方法
    return   new Promise(function (resolve,reject) {
        console.log('正在爬取 ' + url + '\n');

        http.get(url,function(res){
            var html = '';

            res.on('data',function (data) {
                html += data.toString('utf-8');
            })
            res.on('end',function(){
                resolve(html);//把当前的获取到页面的html返回回去（传递下去）
            })

        }).on('error',function (e) {
            reject(e);
            console.log("获取房屋信息出错！");
        })
    })
}


function selecttHtml(html) {//通过页面源码来选择需要爬取的东西
    var $ = cheerio.load(html);
    var contents = $('.zf-top');//某章节下的HTML的源码
		var job = {};

    job.Title = $($('.title-wrapper .content ')).find('h1').text().replace(/^\s+/g,"");//整个课程的大标题
    job.Anytime = $($('.title-wrapper .content .sub span')).eq(1).text().replace(/^\s+/g,"");//随时看房
	  job.Price = $($('.cj-cun .content .price .mainInfo')).text().replace(/^\s+/g,"");//价格
		job.Priceunit = $($('.cj-cun .content .price .mainInfo .unit')).text().replace(/^\s+/g,"");//价格
		job.Area = $($('.cj-cun .content .area .mainInfo')).text().replace(/^\s+/g,"");//大小
		job.Areaunit = $($('.cj-cun .content .area .mainInfo .unit')).text().replace(/^\s+/g,"");//大小
		job.AddrEllipsis=$($('.cj-cun .aroundInfo .addrEllipsis')).attr("title");//地点
		console.log(job.Title);
    return job;
}

function getPageList(Urlpage,locurl){

	return new Promise(function(resolve,reject) {

	});
}



//租房
app.get('/getJobs', function(req, res, next) { // 浏览器端发来get请求
//var page ="d"+req.query.page;  //获取get请求中的参数 page 买房
	 var page="d"+req.query.page+"s22";
	 var Res=res;


	//url 获取信息的页面部分地址
	//var url = 'http://sh.lianjia.com/ershoufang/pudong';
	//var url = 'http://sh.lianjia.com/ershoufang/';
	//var url='http://sh.lianjia.com/ershoufang/?utm_source=baidu&utm_medium=pinzhuan&utm_content=Title&utm_campaign=Main';

	var url='http://sh.lianjia.com/zufang/zhangjiang/';//浦东张江租房
  	var locurl = "http://sh.lianjia.com" ; //获取当前页主域名
	var Urlpage=url+page;
	console.log(url+page+locurl);
	http.get(Urlpage,function(res){  //通过get方法获取对应地址中的页面信息
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
					var houses = [];

					var jobs_list = $("#house-lst li");
					console.log(jobs_list);
          var actions = [];
					$("#house-lst>li").each(function(){   //对页面岗位栏信息进行处理  每个岗位对应一个 li  ,各标识符到页面进行分析得出

							var house = {};
							house.href = locurl+$(this).find(".info-panel h2 a").attr("href"); //标题
							house.propTitle = $(this).find(".info-panel h2 a").attr("title"); //标题
							house.louceng0 = $(this).find(".col-1 .where a span").eq(0).text(); //地点大小
							house.louceng1 = $(this).find(".col-1 .where span").eq(1).text(); //地点大小
							house.louceng2 = $(this).find(".col-1 .where span").eq(2).text(); //地点大小
							house.Other = $(this).find(".other .con a").eq(0).text(); //其他信息
							house.Other1 = $(this).find(".other .con a").eq(1).text(); //其他信息
							house.Other2 = $(this).find(".other .con").text().replace(/^\s+/g,""); //其他信息
							house.price = $(this).find(".col-3 .price .num").text(); //单价
							house.pricePre = $(this).find(".price-pre").text().replace(/^\s+/g,"");//上架时间
							house.see = $(this).find(".col-2 .square .num").text(); //多少人看过此房
						 houses.push(house);

			});

			var ep = new eventproxy();
			ep.after('href_html', houses.length, function (house) {
				console.log("length:"+houses.length);


				housesMany = house.map(function (house) {
					var  href= house[0];
					var propTitle = house[1];
					var louceng0 = house[2];
					var louceng1=house[3];
					var louceng2=house[4];
					var Other = house[5];
					var Other1=house[6];
					var Other2=house[7];
					var price = house[8];
					var pricePre=house[9];
					var see=house[10];
					var topicHtml = house[11];

					var $ = cheerio.load(topicHtml);
					return ({
						href:href,
						propTitle:propTitle,
						louceng0:louceng0,
						louceng1:louceng1,
						louceng2:louceng2,
						Other:Other,
						Other1:Other1,
						Other2:Other2,
						price:price,
						pricePre:pricePre,
						see:see,
						Title :$($('.title-wrapper .content ')).find('h1').text().replace(/^\s+/g,""), //整个课程的大标题
				    Anytime : $($('.title-wrapper .content .sub span')).eq(1).text().replace(/^\s+/g,""), //随时看房
					  Price : $($('.cj-cun .content .price .mainInfo')).text().replace(/^\s+/g,""),//价格
						Priceunit : $($('.cj-cun .content .price .mainInfo .unit')).text().replace(/^\s+/g,""),//价格
						Area : $($('.cj-cun .content .area .mainInfo')).text().replace(/^\s+/g,""),//大小
						Areaunit : $($('.cj-cun .content .area .mainInfo .unit')).text().replace(/^\s+/g,""),//大小
						AddrEllipsis : $($('.cj-cun .aroundInfo .addrEllipsis')).attr("title"),//地点
					});
				});

				console.log('final:');
				console.log(housesMany);
				 Res.json({  //返回json格式数据给浏览器端
						jobs:housesMany
				});
			});

			houses.forEach(function (house) {
				superagent.get(house["href"])
					.end(function (err, res) {
						//console.log('fetch ' + topicUrl["Visits"] + ' successful');
						ep.emit('href_html', [house["href"],house["propTitle"],house["louceng0"],house["louceng1"] ,
						house["louceng2"],house["Other"],house["Other1"],house["Other2"],house["price"],house["pricePre"],house["see"],res.text]);
					});
			});

		});
			//当执行http请求失败的时候，返回错误信息
		 res.on('error', function(e) {
				 reject(e.message);
		 });
	});

});

//买房
// app.get('/getJobs', function(req, res, next) { // 浏览器端发来get请求
// var page ="d"+req.query.page;  //获取get请求中的参数 page
// console.log("page: "+page);
//
// var Res = res;  //保存，防止下边的修改
// //url 获取信息的页面部分地址
// //var url = 'http://sh.lianjia.com/ershoufang/pudong';
// var url = 'http://sh.lianjia.com/ershoufang/';
// //var url='http://sh.lianjia.com/ershoufang/?utm_source=baidu&utm_medium=pinzhuan&utm_content=Title&utm_campaign=Main';
//
// http.get(url+page,function(res){  //通过get方法获取对应地址中的页面信息
//     var chunks = [];
//     var size = 0;
//     res.on('data',function(chunk){   //监听事件 传输
//         chunks.push(chunk);
//         size += chunk.length;
//     });
//     res.on('end',function(){  //数据传输完
//         var data = Buffer.concat(chunks,size);
//         var html = data.toString();
//         //console.log(html);
//         var $ = cheerio.load(html); //cheerio模块开始处理 DOM处理
//         var jobs = [];
//
// 				var jobs_list = $(".js_fang_list li");
//         $(".js_fang_list>li").each(function(){   //对页面岗位栏信息进行处理  每个岗位对应一个 li  ,各标识符到页面进行分析得出
//             var job = {};
//             //job.company = $(this).find(".info-table span").eq(1).find("a").html(); //公司名
// 						job.propTitle = $(this).find(".prop-title a").attr("title"); //岗位链接
//             job.louceng = $(this).find(".info-row span").eq(0).html().replace('svg',"").replace('<',"").replace('>',""); //楼层
//             job.totalPrice = $(this).find(".info-row span").eq(1).html(); //金额
//             job.unit = $(this).find(".info-row span").eq(2).html(); //单价
//
//              job.city0 = $(this).find(".row2-text a").eq(0).html(); //楼盘
// 						 job.city1 = $(this).find(".row2-text a").eq(1).html(); //地点1
// 						job.city2 = $(this).find(".row2-text a").eq(2).html(); //地点2
//             job.salary = $(this).find(".info-col.price-item.minor").html(); //单价
//              job.juli = $(this).find(".property-tag-container span").eq(0).html(); //距离
//              job.wu = $(this).find(".property-tag-container span").eq(1).html(); //满五
// 						 job.yaoshi = $(this).find(".property-tag-container span").eq(2).html(); //有误钥匙
//
//
//             jobs.push(job);
//         });
//         Res.json({  //返回json格式数据给浏览器端
//             jobs:jobs
//         });
// 				  console.log(jobs.length);  //控制台输出岗位名
//     });
// });
//
// });

//
// app.get('/link_detail', (req, res)=>{
//
//   //  console.log('link_detail');
// 		var topic=req.query.topic;
// 		var release_date=new Date(req.query.release_date).toLocaleString().substring(0,10);
// 		var message=req.query.message;
// 		var tags=req.query.tags;
// 		var link=req.query.link;
// 		var m_address=req.query.m_address;
// 		var r_planing=req.query.r_planing;
// 		var designer=req.query.designer;
// 		var front_end=req.query.front_end;
// 		var media_source=req.query.media_source;
// 		var off_shelf=req.query.off_shelf;
//
//    //console.log(tags);
// 	 res.render("link", {title : topic, release_date : release_date,message:message,tags:tags,link:link,m_address:m_address,r_planing:r_planing,designer:designer,front_end:front_end,media_source:media_source,off_shelf:off_shelf});
// });
//
// // app.app("*", function(request, response, next) {
// //   response.writeHead(200, { "Content-Type": "text/plain" });
// //   next();
// // });
//
// app.get('/userlist', (req, res)=>{
//
//    var all = req.query.all;
// 	 console.log(all);
// 	 var p = req.query.p;
//    var limit = req.query.limit;
// 	 var sdate=req.query.sdate;
// 	var edate=req.query.edate;
// console.log(sdate,edate);
// 	 if(!sdate) sdate='2001-01-01';
// 	 if(!edate) edate='2100-01-01'
// 	 if(!p || p <1){
// 					p = 1;
// 		}
// 	 if(!limit || limit<1){
// 					limit = 9;
// 		}
//    console.log(p,limit);
// 	 if(all=='All' ){
// 		 	var Sql_limt="select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data order by release_date asc";
// 	 }else{
// 		 	var Sql_limt="select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data where  release_date between '"+sdate+"' and '"+edate+"' order by release_date desc LIMIT "+(p-1)*limit+","+limit;
// 	 }
//
//   // res.writeHead(200,{"Content-Type":'application/x-json','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
// 	var db = connectMysql();
// 	var data = {currentPage:p,totalPages:0};
// 	var Sql_count="select count(1) count from test.lp_data";
//
// 	 db.query(Sql_count,function selectCb(err,result){
// 			 if(result){
//           console.log("resc="+result[0].count);
// 					 data.totalPages = Math.ceil(result[0].count/limit);
// 					 data.totalnum = result[0].count;
// 				   data.limit = limit;
// 					 data.startpage=(data.currentPage-1)*data.limit;
// 					 //console.log("��ȡ������"+data.totalPages);
// 			 }
//
// 			 db.query(Sql_limt,function(err,result){
//
// 				   data.total=result[0].count;
// 					 console.log("rescoun="+result);
// 					 data.items = result;
// 				   console.log(Sql_limt);
// 					 //console.log(data);
// 					 res.render("lp_list",data);
//            res.end();
// 			 });
// 	 });
//
// });
//
//
//
// var date = new Date();
// var year = date.getFullYear();
// var month = date.getMonth()+1;
// var day = date.getDate();
// var hour = date.getHours();
// var minute = date.getMinutes();
// var second = date.getSeconds();
// var ymd=year.toString()+month.toString()+day.toString()+Math.ceil(Math.random()*10);
//
// app.get('/output', function(req, res, next){
//
//
// 		var db = connectMysql();
// 		var lpDataSql = "select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data order by release_date desc";
//
// 		 db.query(lpDataSql,	function selectCb(err, results){
//
// 			 if (err) {throw err;}
// 			 db.end();
// 			 var content='';
// 			 var conf = {};
// 			 conf.cols = [
// 			   {caption:'�� ��', type:'string'},
// 			   {caption:'�� ��', type:'string'},
// 			   {caption:'ʱ ��', type:'date'},
// 			   {caption:'�� ��', type:'number'},
// 			   {caption:'�� ϸ', type:'string'},
//        ];
// 			 var array = [];obj=[];
// 			 var time='';
// 			 for(var i=0,len=results.length;i<len;i++){
//
// 					var time =
// 					new Date(results[i]['release_date']).toLocaleString().substring(0,10);
// 					var obj = [ results[i]['topic'],  results[i]['link'], time,  89, 'a'];
// 					 array.push( obj);
//
// 			 }
//
// 				conf.rows = array;
// 				var result1 = nodeExcel.execute(conf);
//
//         var filename =ymd+".xlsx";
// 			 res.setHeader('Content-Type', 'application/vnd.openxmlformats');
//
// 			 res.setHeader("Content-Disposition", 'attachment; filename='+encodeURIComponent(filename));
//
// 			 res.end(result1, 'binary');
//
// 		 });
//
// });
//
//
// app.post('/getlogin', (req, res, next)=>{
//
//   // console.log(req.query.data);
//    console.log(req.files);
//
// 	 var date = new Date();
// 	 var year = date.getFullYear();
// 	 var month = date.getMonth()+1;
// 	 var day = date.getDate();
// 	 var hour = date.getHours();
// 	 var minute = date.getMinutes();
// 	 var second = date.getSeconds();
// 	 //console.log(year.toString()+month.toString()+day.toString()+hour.toString()+minute.toString()+second.toString());
// 	 var lp_id=year.toString()+month.toString()+day.toString()+hour.toString()+minute.toString()+second.toString();
//
// 			for(var i=0;i<req.files.length;i++){
//
// 				var file=req.files[i];
// 				var ext=pathLib.parse(file.originalname).ext;
// 				var dir=pathLib.parse(file.path).dir;
//       	var picture=pathLib.parse(file.originalname).base;
// 				var picture1=lp_id+ext;
//       //console.log(pathLib.parse(file.path));
// 			//'www\\upload\\8dd9b360eb694d219a9d64c1718a9e33'
// 			//	var newPath=dir+'/'+new Date().getTime()+Math.random()+ext;
// 			 var newPath=dir+'/'+lp_id+ext;
// 				//'www\\upload\\8dd9b360eb694d219a9d64c1718a9e33.gif'
// 				fs.rename(file.path, newPath, (err)=>{});
// 			}
//
//
// 			//console.log(picture);
//        	res.writeHead(200,{"Content-Type":'text/plain','charset':'utf-8'});
// 					if(req.body){
// 					 var db = connectMysql();
//
//          console.log(JSON.stringify(req.body.media_all));
// 				//	alert(year+'��'+month+'��'+day+'�� '+hour':'+minute+':'+second);
// 					 var sql = "insert into test.lp_data (topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,lp_id,type,brand) values ("+JSON.stringify(req.body.topic)+","+JSON.stringify(req.body.release_date)+","+JSON.stringify(req.body.message)+","+JSON.stringify(req.body.tags)+","+JSON.stringify(req.body.link)+","+JSON.stringify(picture1)+","+JSON.stringify(req.body.r_planing)+","+JSON.stringify(req.body.designer)+","+JSON.stringify(req.body.front_end)+","+JSON.stringify(req.body.front_end)+","+JSON.stringify(lp_id)+","+JSON.stringify(req.body.media_all)+","+JSON.stringify(req.body.brand)+")";
// 				  	console.log(sql);
// 					 db.query(sql,	function selectCb(err, results){
// 			 //�����쳣
// 			    //  console.log(results.insertId);
// 						 if (err) {throw err;}
// 						 db.end('');
// 						res.end('�����ɹ�');
// 					 });
// 			 }else{
// 					 res.end('����д������Ϣ</html>');
// 			 }
// 		// res.end(JSON.stringify(Dataparse.username));
//
//
// });
//
// // app.get('/postlogin', (req, res)=>{
// // 		fs.readFile("./views/lp_list.html","utf-8",function(e,data){
// // 		res.writeHead(200,{"Content-Type":"text/html"});
// // 	  res.write(data);
// // 	  res.end();
// // 		});
// //
// //
// // });
// //
// app.get('/lpdata', (req, res)=>{
//
//   var getData='';
// 	req.addListener('data', function(chunk){
// 			 getData += chunk;
// 		}).on('end', function(){
// 		// res.writeHead(200,{"Content-Type":'text/plain','charset':'utf-8'});
// 		 res.writeHead(200,{"Content-Type":'application/x-json','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
// 			 var Dataparse = qs.parse(getData);
// 			//	console.log(Dataparse);
// 					 if(Dataparse ){
// 						var db = connectMysql();
// 						var lpDataSql = "select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data order by release_date desc ";
// 					 //console.log(lpDataSql);
// 						db.query(lpDataSql,	function selectCb(err, results){
// 				//�����쳣
// 			//	console.log(results);
// 				if (err) {throw err;}
// 				db.end();
// 				 //data.items = results;
// 				//res.render("lp_list",data);
// 				res.end(JSON.stringify(results));
// 			});
//
//
// 				}else{
// 						res.end('������Ϣ��</html>');
// 				}
// 		// res.end(JSON.stringify(Dataparse.username));
//
// 	 });
// });
//
// app.get('/tags', (req, res)=>{
//
//   var getData='';
// 	req.addListener('data', function(chunk){
// 			 getData += chunk;
// 		}).on('end', function(){
//
// 			 var Dataparse = qs.parse(getData);
//
// 					 if(Dataparse ){
// 						var db = connectMysql();
// 						var lpDataSql = "select tags from  test.lp_data order by release_date desc ";
// 					 //console.log(lpDataSql);
// 						db.query(lpDataSql,	function selectCb(err, results){
// 				//�����쳣
// 			//	console.log(results);
// 				if (err) {throw err;}
// 				db.end();
// 				 //data.items = results;
// 				//res.render("lp_list",data);
// 				res.end(JSON.stringify(results));
// 			});
//
//
// 				}else{
// 						res.end('������Ϣ��</html>');
// 				}
// 		// res.end(JSON.stringify(Dataparse.username));
//
// 	 });
// });
//
//
// //app.use(function(req, res, next) {
// //	console.log(res.body);
// app.get('/searchdate', (req, res)=>{
//  //if (req.url == "/userlist2") {
// 	 console.log('/searchdate');
//    var getData='';
//
// 	 var sdate=req.query.sdate;
// 	 var edate=req.query.edate;
//
//    console.log(sdate,edate);
//
// 	req.addListener('data', function(chunk){
// 			 getData += chunk;
// 		}).on('end', function(){
//
// 		// res.writeHead(200,{"Content-Type":'text/plain','charset':'utf-8'});
// 		//  res.writeHead(200,{"Content-Type":'application/x-json','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
// 	  var Dataparse = qs.parse(getData);
//
//   	var data = {currentPage:1,totalPages:23};
// 		 if(Dataparse){
// 					var db = connectMysql();
// 					var lpDataSql = "select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data where  release_date between '"+sdate+"' and '"+edate+"' order by release_date  desc";
//
// 						db.query(lpDataSql,function selectCb(err, result){
// 				//�����쳣
//                 data.startpage = 2;
// 				        if (err) {throw err;}
// 				        db.end();
// 								//console.log(results[0]);
// 								//  data.items = results;
// 							 //	res.render("lp_list",data);
// 						  //res.render("lp_body",data);
// 					 // 	   console.log(lpDataSql+":"+JSON.stringify(result));
// 				    res.end(JSON.stringify(result));
// 			});
// 				}else{
// 						res.end('������Ϣ��</html>');
// 				}
// 		//  res.end(JSON.stringify(results));
//
// 	 });
// //	}
// 	// next();
// });
//
// app.get('/brand', (req, res)=>{
//  //if (req.url == "/userlist2") {
// 	 console.log('/brand');
//    var getData='';
//    var brand=req.query.brand;
//
//
//    console.log(brand);
//
// 	 req.addListener('data', function(chunk){
// 			 getData += chunk;
// 		}).on('end', function(){
//
// 	  var Dataparse = qs.parse(getData);
// 		 if(Dataparse){
// 					var db = connectMysql();
// 					var lpDataSql = "select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data where  brand='"+brand+"' order by release_date  desc";
// 						db.query(lpDataSql,function selectCb(err, result){
// 				//�����쳣
// 				        if (err) {throw err;}
// 				        db.end();
// 				   //console.log(lpDataSql+":"+JSON.stringify(result));
// 				    res.end(JSON.stringify(result));
// 			});
// 				}else{
// 						res.end('������Ϣ��</html>');
// 				}
// 	 });
// });
//
//
// app.get('/search', (req, res)=>{
// //app.use(function(request, response, next) {
// 	 //if (request.url == "/search") {
// //	console.log('search');
//    var getData='';
//    var type=req.query.type;
// 	 var text_input=req.query.text_input;
//
//    //console.log(type,text_input);
// 	req.addListener('data', function(chunk){
// 			 getData += chunk;
// 		}).on('end', function(){
//
// 			 var Dataparse = qs.parse(getData);
//      if (type=='0') type='';
// 		 if (text_input=='') text_input='012312323';//����
//
// 		 if(Dataparse){
// 						var db = connectMysql();
// 						var lpDataSql = "select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data where  type like'%"+type+"%' and topic like '%"+text_input+"%'  union   select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type from  test.lp_data  where   type like'%"+type+"%' and message like '%"+text_input+"%'   order by release_date  desc";
// 					  console.log(lpDataSql);
// 						db.query(lpDataSql,	[],function selectCb(err, results){
// 				//�����쳣
//
// 				if (err) {throw err;}
//
// 				res.end(JSON.stringify(results));
// 			});
// 				}else{
// 						res.end('������Ϣ��</html>');
// 				}
//
//
// 	 });
// 	//}
// });
//
// app.get('/score', (req, res)=>{
//
//   console.log('score');
// 	req.addListener('data', function(chunk){
// 			 getData += chunk;
// 		}).on('end', function(){
// 						var db = connectMysql();
// 						var lpDataSql = "select topic,release_date,message,tags,link,m_address,r_planing,designer,front_end,media_source,off_shelf,type,score from  test.lp_data  order by score  desc";
// 					  console.log(lpDataSql);
// 						db.query(lpDataSql,	[],function selectCb(err, results){
// 				//�����쳣
//
// 				if (err) {throw err;}
// 				//db.end();
//       //  console.log(JSON.stringify(results));
// 				res.end(JSON.stringify(results));
// 			});
//
//
//
// 	 });
// 	//}
// });
