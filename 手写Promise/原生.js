console.log('第一步');
let promise = new Promise((resolve, reject) => {
	console.log('第二步');
	//resolve是微任务 setTimeout是宏任务 微任务优先
	setTimeout(() => {
		resolve('xxx');
		console.log('第四步');
	});
});
// console.log(promise);
promise.then(
	(result) => {
		console.log(result);
	},
	(result) => {
		console.log(result.message);
	}
);
console.log('第三步');
