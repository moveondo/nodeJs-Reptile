// function getNumber(){
//     var p = new Promise(function(resolve, reject){
//         //做一些异步操作
//         setTimeout(function(){
//             var num = Math.ceil(Math.random()*10); //生成1-10的随机数
//             if(num<=5){
//                 resolve(num);
//             }
//             else{
//                 reject('数字太大了');
//             }
//         }, 2000);
//     });
//     return p;
// }
//
// getNumber()
// .then(
//     function(data){
//         console.log('resolved');
//         console.log(data);
//     },
//     function(reason, data){
//         console.log('rejected');
//         console.log(reason);
//     }
// );

function runAsync1(){
    return new Promise(function(resolve, reject){
        //做一些异步操作
        setTimeout(function(){
            console.log('2秒以后了异步吗+1：');
            resolve('1：执行了');
        }, 1000);
    });

}
function runAsync2(){
    return new Promise(function(resolve, reject){
        //做一些异步操作
        setTimeout(function(){
           console.log('2秒以后了+2：');
            resolve('2：执行了');
        }, 2000);
    });

}
function runAsync3(){
    return new Promise(function(resolve, reject){
        //做一些异步操作
        setTimeout(function(){
            console.log('2秒以后了+3：');
            resolve('3：执行了');
        }, 2000);
    });

}

// Promise
// .all([ runAsync2(), runAsync3(),runAsync1()])
// .then(function(results){
//     console.log(results);
// });

Promise
.race([ runAsync2(), runAsync3(),runAsync1()])
.then(function(results){
    console.log(results);
});

// function requestImg(){
//     var p = new Promise(function(resolve, reject){
//         var img = new Image();
//         img.onload = function(){
//             resolve(img);
//         }
//         img.src = 'xxxxxx';
//     });
//     return p;
// }
//
// //延时函数，用于给请求计时
// function timeout(){
//     var p = new Promise(function(resolve, reject){
//         setTimeout(function(){
//             reject('图片请求超时');
//         }, 5000);
//     });
//     return p;
// }
//
// Promise
// .race([requestImg(), timeout()])
// .then(function(results){
//     console.log(results);
// })
// .catch(function(reason){
//     console.log(reason);
// });





//
// runAsync1().then(function(data){
//     console.log(data);
//     return runAsync2();
// }).then(function(data){
//     console.log(data);
//     return '直接返回数据';  //这里直接返回数据
// }).then(function(data){
//     console.log("执行了吗1？"+data);
// }).then(function(data){
//     console.log("执行了吗2？"+data);
// }).then(function(data){
//     console.log("执行了吗3？"+data);
// });
