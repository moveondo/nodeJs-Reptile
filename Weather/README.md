# nodeJs-Weather

nodejs 实现天气查询：

![result](https://github.com/moveondo/nodeJs-Weather/blob/master/image/1.png)  

###  技术分析

#### process.stdin.setEncoding('utf8')

  process对象用于处理与当前进程相关的事情，它是一个全局对象，可以在任何地方直接访问到它而无需引入额外模块。 它是 EventEmitter 的一个实例。
  
 ##### process.stdin：
 
 一个指向 标准输入流(stdin) 的可读流(Readable Stream)。标准输入流默认是暂停 (pause) 的，所以必须要调用 process.stdin.resume() 来恢复 (resume) 接收:
 
```
process.stdin.on('end', function() {
    process.stdout.write('end');
});

function gets(cb){
    process.stdin.setEncoding('utf8');
    //输入进入流模式（flowing-mode，默认关闭，需用resume开启），注意开启后将无法read到数据
    //见 https://github.com/nodejs/node-v0.x-archive/issues/5813
    process.stdin.resume();
    process.stdin.on('data', function(chunk) {
        console.log('start!');
        //去掉下一行可一直监听输入，即保持标准输入流为开启模式
        process.stdin.pause();
        cb(chunk);
    });
    console.log('试着在键盘敲几个字然后按回车吧');
}

gets(function(reuslt){
    console.log("["+reuslt+"]");
    //process.stdin.emit('end'); //触发end事件
});

```

#### process.stdout

一个指向标准输出流(stdout)的 可写的流(Writable Stream)：
```
process.stdout.write('这是一行数据\n这是第二行数据');
```

另可使用 process.stdout.isTTY 来判断当前是否处于TTY上下文。

举例：
```
/*1:声明变量*/
var num1, num2;
/*2：向屏幕输出，提示信息，要求输入num1*/
process.stdout.write('请输入num1的值：');
/*3：监听用户的输入*/
process.stdin.on('data', function (chunk) {
    if (!num1) {
        num1 = Number(chunk);
        /*4：向屏幕输出，提示信息，要求输入num2*/
        process.stdout.write('请输入num2的值:');
    } else {
        num2 = Number(chunk);
        process.stdout.write('结果是：' + (num1 * num2));
    }
});

```
结果：

![](https://github.com/moveondo/nodeJs-Weather/blob/master/image/2.png)  

  
其余process_stdin函数可参考链接：[process_stdin](http://nodejs.cn/api/process.html#process_process_stdin)   




