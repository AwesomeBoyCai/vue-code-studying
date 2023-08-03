class MyPromise {
	static PENDING = '待定';
	static FULFILLED = '成功';
	static REJECTED = '拒绝';
	//func就是promise内的回调函数
	constructor(func) {
		this.status = MyPromise.PENDING;
		this.result = null;
		//实现then方法多次调用添加多个处理函数 初始化回调为数组依次执行
		this.resolveCallbacks = [];
		this.rejectCallbacks = [];
		//1. 当执行promise时候抛出错误，要进行判断，如果无异常正常执行
		//如果错误，直接调用reject方法，并把错误信息传递过去
		try {
			//在构造实例的时候立即调用该函数
			func(this.resolve.bind(this), this.reject.bind(this));
		} catch (error) {
			this.reject(error);
		}
	}
	resolve(result) {
		//resolve和reject要在事件循环末尾来执行的
		//加上setTimeout
		setTimeout(() => {
			this.status = MyPromise.FULFILLED;
			this.result = result;
			//遍历数组，是否有then保留的待执行函数
			this.resolveCallbacks.forEach((callback) => {
				callback(result);
			});
		});
	}
	reject(result) {
		setTimeout(() => {
			this.status = MyPromise.REJECTED;
			this.result = result;
			this.rejectCallbacks.forEach((callback) => {
				callback(result);
			});
		});
	}
	//then方法
	//两个参数，成功的回调，失败的回调
	then(onFULFILLED, onREJECTED) {
		//Promise的链式，允许then.then需要返回一个Promise
		return new MyPromise((resolve, reject) => {
			// 2. Promise允许then方法参数不是函数时候要省略，所以要判断then方法的两个参数是不是函数
			//不是函数，赋值为空函数
			onFULFILLED =
				typeof onFULFILLED === 'function' ? onFULFILLED : () => {};
			onREJECTED =
				typeof onREJECTED === 'function' ? onREJECTED : () => {};

			//判断
			if (this.status === MyPromise.PENDING) {
				//因为resolve 和 reject的方法还没有获取到值
				//需要让then中的函数稍后执行，等resolve执行后了再执行then,保存当前的函数参数
				this.resolveCallbacks.push(onFULFILLED);
				this.rejectCallbacks.push(onREJECTED);
			}
			if (this.status === MyPromise.FULFILLED) {
				setTimeout(() => {
					onFULFILLED(this.result);
				});
			}
			if (this.status === MyPromise.REJECTED) {
				setTimeout(() => {
					onREJECTED(this.result);
				});
			}
		});
	}
}
