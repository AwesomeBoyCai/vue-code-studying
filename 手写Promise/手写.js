class Commitment {
	static PENDING = '待定';
	static FULFILLED = '成功';
	static REJECTED = '拒绝';
	//func就是promise内的回调函数
	constructor(func) {
		this.status = Commitment.PENDING;
		this.result = null;
		//实例化时保存resolve函数
		this.resolveCallbacks = [];
		//实例化时保存reject函数
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
			this.status = Commitment.FULFILLED;
			this.result = result;
			//遍历数组，是否有then保留的待执行函数
			this.resolveCallbacks.forEach((callback) => {
				callback(result);
			});
		});
	}
	reject(result) {
		setTimeout(() => {
			this.status = Commitment.REJECTED;
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
		return new Commitment((resolve, reject) => {
			// 2. Promise允许then方法参数不是函数时候要省略，所以要判断then方法的两个参数是不是函数
			//不是函数，赋值为空函数
			onFULFILLED =
				typeof onFULFILLED === 'function' ? onFULFILLED : () => {};
			onREJECTED =
				typeof onREJECTED === 'function' ? onREJECTED : () => {};

			//判断
			if (this.status === Commitment.PENDING) {
				//因为resolve 和 reject的方法还没有获取到值
				//需要让then中的函数稍后执行，等resolve执行后了再执行then,保存当前的函数参数
				this.resolveCallbacks.push(onFULFILLED);
				this.rejectCallbacks.push(onREJECTED);
			}
			if (this.status === Commitment.FULFILLED) {
				setTimeout(() => {
					onFULFILLED(this.result);
				});
			}
			if (this.status === Commitment.REJECTED) {
				setTimeout(() => {
					onREJECTED(this.result);
				});
			}
		});
	}
}
console.log('第一步');
let commitment = new Commitment((resolve, reject) => {
	console.log('第二步');
	//'xxx'未被输出 then方法未被执行
	setTimeout(() => {
		// console.log(commitment.status);
		resolve('xxx');
		// console.log(commitment.status);
		console.log('第四步');
	});
	// throw new Error('xxx');
});
commitment
	.then(
		(result) => {
			//这里发现then里面的状态未被输出
			//第一 第二 第三 then 此时then是待定状态 未对它做出处理 所以未输出
			// console.log(commitment.status);
			console.log(result);
		},
		(result) => {
			console.log(result.message);
		}
	)
	.then(
		(result) => {
			console.log(result);
		},
		(result) => console.log(result.message)
	);
console.log('第三步');
