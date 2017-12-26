## Promise
 
### ES6 Promise 

复杂的概念先不讲，我们先简单粗暴地把Promise用一下，有个直观感受。那么第一个问题来了，Promise是什么玩意呢？是一个类？对象？数组？函数？

别猜了，直接打印出来看看吧，console.dir(Promise)，就这么简单粗暴。

 ![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/dir.png) 
 
 这么一看就明白了，Promise是一个构造函数，自己身上有all、reject、resolve这几个眼熟的方法，原型上有then、catch等同样很眼熟的方法。这么说用Promise new出来的对象肯定就有then、catch方法喽，没错。
 
 ```
 function runAsync(){
    var p = new Promise(function(resolve, reject){
        //做一些异步操作
        setTimeout(function(){
            console.log('执行完成');
            resolve('随便什么数据');
        }, 2000);
    });
    return p;            
}
runAsync()

 ```
 这时候你应该有两个疑问：
 
 * 1.包装这么一个函数有毛线用？
 * 2.resolve('随便什么数据');这是干毛的？
 
我们继续来讲。在我们包装好的函数最后，会return出Promise对象，也就是说，执行这个函数我们得到了一个Promise对象。还记得Promise对象上有then、catch方法吧？这就是强大之处了，看下面的代码：

```
runAsync().then(function(data){
    console.log(data);
    //后面可以用传过来的数据做些其他操作
    //......
});
```

在runAsync()的返回上直接调用then方法，then接收一个参数，是函数，并且会拿到我们在runAsync中调用resolve时传的的参数。运行这段代码，会在2秒后输出“执行完成”，紧接着输出“随便什么数据”。
 
这时候你应该有所领悟了，原来then里面的函数就跟我们平时的回调函数一个意思，能够在runAsync这个异步任务执行完成之后被执行。这就是Promise的作用了，简单来讲，就是能把原来的回调写法分离出来，在异步操作执行完后，用链式调用的方式执行回调函数。

你可能会不屑一顾，那么牛逼轰轰的Promise就这点能耐？我把回调函数封装一下，给runAsync传进去不也一样吗，就像这样：
```
function runAsync(callback){
    setTimeout(function(){
        console.log('执行完成');
        callback('随便什么数据');
    }, 2000);
}

runAsync(function(data){
    console.log(data);
});
```
效果也是一样的，还费劲用Promise干嘛。那么问题来了，有多层回调该怎么办？如果callback也是一个异步操作，而且执行完后也需要有相应的回调函数，该怎么办呢？总不能再定义一个callback2，然后给callback传进去吧。而Promise的优势在于，可以在then方法中继续写Promise对象并返回，然后继续调用then来进行回调操作。

### 链式操作的用法

所以，从表面上看，Promise只是能够简化层层回调的写法，而实质上，Promise的精髓是“状态”，用维护状态、传递状态的方式来使得回调函数能够及时调用，它比传递callback函数要简单、灵活的多。所以使用Promise的正确场景是这样的：

```
runAsync1()
.then(function(data){
    console.log(data);
    return runAsync2();
})
.then(function(data){
    console.log(data);
    return runAsync3();
})
.then(function(data){
    console.log(data);
});

function runAsync1(){
    return new Promise(function(resolve, reject){
        //做一些异步操作
        setTimeout(function(){
            console.log('2秒以后了异步吗+1：');
            resolve('1：执行了');
        }, 2000);
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

```
这样能够按顺序，每隔两秒输出每个异步回调中的内容，在runAsync2中传给resolve的数据，能在接下来的then方法中拿到。运行结果如下：


 ![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/async1.png) 
 
 
 在then方法中，你也可以直接return数据而不是Promise对象，在后面的then中就可以接收到数据了，比如我们把上面的代码修改成这样：
 
```
 runAsync1().then(function(data){
    console.log(data);
    return runAsync2();
}).then(function(data){
    console.log(data);
    return '直接返回数据';  //这里直接返回数据
}).then(function(data){
    console.log("执行了吗1？"+data);
}).then(function(data){
    console.log("执行了吗2？"+data);
}).then(function(data){
    console.log("执行了吗3？"+data);
});

```
结果为：

 ![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/async2.png) 
 
### reject的用法

到这里，你应该对“Promise是什么玩意”有了最基本的了解。那么我们接着来看看ES6的Promise还有哪些功能。我们光用了resolve，还没用reject呢，它是做什么的呢？事实上，我们前面的例子都是只有“执行成功”的回调，还没有“失败”的情况，reject的作用就是把Promise的状态置为rejected，这样我们在then中就能捕捉到，然后执行“失败”情况的回调。看下面的代码。

```
function getNumber(){
    var p = new Promise(function(resolve, reject){
        //做一些异步操作
        setTimeout(function(){
            var num = Math.ceil(Math.random()*10); //生成1-10的随机数
            if(num<=5){
                resolve(num);
            }
            else{
                reject('数字太大了');
            }
        }, 2000);
    });
    return p;
}

getNumber()
.then(
    function(data){
        console.log('resolved');
        console.log(data);
    },
    function(reason, data){
        console.log('rejected');
        console.log(reason);
    }
);
```
多次执行后结果：

 ![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/reject.png) 
 
### all的用法

Promise的all方法提供了并行执行异步操作的能力，并且在所有异步操作执行完后才执行回调。我们仍旧使用上面定义好的runAsync1、runAsync2、runAsync3这三个函数，看下面的例子：

```
Promise
.all([runAsync1(), runAsync2(), runAsync3()])
.then(function(results){
    console.log(results);
});

```
 用Promise.all来执行，all接收一个数组参数，里面的值最终都算返回Promise对象。这样，三个异步操作的并行执行的，等到它们都执行完后才会进到then里面。那么，三个异步操作返回的数据哪里去了呢？都在then里面呢，all会把所有异步操作的结果放进一个数组中传给then，就是上面的results。所以上面代码的输出结果就是：
 
  ![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/all.png)
  
  
### race的用法
all方法的效果实际上是「谁跑的慢，以谁为准执行回调」，那么相对的就有另一个方法「谁跑的快，以谁为准执行回调」，这就是race方法，这个词本来就是赛跑的意思。race的用法与all一样，我们把上面runAsync1的延时改为1秒,runAsync2的延时改为2秒,runAsync3的延时改为3秒来看一下：

```
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


Promise
.race([ runAsync2(), runAsync3(),runAsync1()])
.then(function(results){
    console.log(results);
});
```

这三个异步操作同样是并行执行的。结果你应该可以猜到，1秒后runAsync1已经执行完了，此时then里面的就执行了。结果是这样的：

  ![](https://github.com/moveondo/nodeJs-Reptile/blob/master/image/race.png)
 

这个race有什么用呢？使用场景还是很多的，比如我们可以用race给某个异步请求设置超时时间，并且在超时后执行相应的操作

### 总结

ES6 Promise的内容就这些吗？是的，能用到的基本就这些。

我怎么还见过done、finally、success、fail等，这些是啥？这些并不在Promise标准中，而是我们自己实现的语法糖。
 
本文中所有异步操作均以setTimeout为例子，之所以不使用ajax是为了避免引起混淆，因为谈起ajax，很多人的第一反应就是jquery的ajax，而jquery又有自己的Promise实现。如果你理解了原理，就知道使用setTimeout和使用ajax是一样的意思。说起jquery，我不得不吐槽一句，jquery的Promise实现太过垃圾，各种语法糖把人都搞蒙了，我认为Promise之所以没有全面普及和jquery有很大的关系。后面我们会细讲jquery。

