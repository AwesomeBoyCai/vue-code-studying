console.log('第一步');
// let myPromise = new MyPromise((resolve, reject) => {
// 	console.log('第二步');
// 	//'xxx'未被输出 then方法未被执行
// 	setTimeout(() => {
// 		// console.log(MyPromise .status);
// 		resolve('xxx');
// 		// console.log(MyPromise .status);
// 		console.log('第四步');
// 	});
// 	// throw new Error('xxx');
// });
// myPromise
// 	.then(
// 		(result) => {
// 			//这里发现then里面的状态未被输出
// 			//第一 第二 第三 then 此时then是待定状态 未对它做出处理 所以未输出
// 			// console.log(MyPromise .status);
// 			console.log(result);
// 		},
// 		(result) => {
// 			console.log(result.message);
// 		}
// 	)
// 	.then(
// 		(result) => {
// 			console.log(result);
// 		},
// 		(result) => console.log(result.message)
// 	);
// console.log('第三步');