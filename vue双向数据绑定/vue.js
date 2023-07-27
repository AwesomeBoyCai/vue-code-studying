//创建vue类
class Vue {
	//执行初始化
	constructor(obj_instance) {
		this.$data = obj_instance.data;
		//调用Observe - 对data中的每个数据进行数据劫持
		//对data中的每一项进行响应式处理
		Observer(this.$data);

		//解析模板
		Compile(obj_instance.el, this);
	}
}

//数据劫持 - 监听实例中的数据
function Observer(data_instance) {
	//递归出口
	if (!data_instance || typeof data_instance !== 'object') return;
  //创建订阅者实例
  const dependency = new Dependency()
	//object.keys以数组形式返回对象中的属性
  // console.log(Object.keys(data_instance));
	//遍历属性属性，通过obj.defineProperty来进行数据监视
	Object.keys(data_instance).forEach((key) => {
		let value = data_instance[key];
		//递归将 子属性的值进行数据劫持
		Observer(value);
		//三个参数，(对象， 监视的属性， 回调)
		Object.defineProperty(data_instance, key, {
			//可以枚举 属性描述符可以改变
			enumerable: true,
			configurable: true,
			//通过getter 和 setter函数进行数据监视
			get() {
				//访问属性时候 调用getter函数 返回return 值
				console.log(`访问了属性：${key} -> 值为${value}`);
        // console.log(Dependency.temp);
        //将订阅者实例添加到订阅者数组中
        Dependency.temp && dependency.addSub(Dependency.temp)
				return value;
			},
			//修改的新属性值
			set(newValue) {
				console.log(`将属性：${key}的值${value} 修改为->${newValue}`);
				value = newValue;
				Observer(newValue);
        dependency.notify()
			},
		});
	});
}

//HTML模板解析 - {{}}替换dom
function Compile(element, vm) {
	//获取id为app的dom元素 绑定到vm.$el上
	vm.$el = document.querySelector(element);
	// console.log(vm.$el);
	//创建文档碎片节点 临时存储数据的改变 避免过频繁地操作dom 文档片段存储在于内存中不在dom中，元素的改变不会引起页面的回流
	const fragment = document.createDocumentFragment();
	//循环将vm.$el中的dom元素 插入到fragment文档碎片中
	let child;
	while ((child = vm.$el.firstChild)) {
		//使用fragment.append会将原先dom删除
		fragment.append(child);
	}
	// console.log(fragment);
	// console.log(fragment.childNodes);
	//要将{{}}替换 所以节点类型为 1 和 3为h3
	fragment_compile(fragment);
	//替换文档碎片内容
	function fragment_compile(node) {
		//正则匹配 {{ 属性 }}
		const pattern = /\{\{\s*(\S+)s*}\}/;
		//如果节点为文本节点
		if (node.nodeType === 3) {
      const temp = node.nodeValue
			//输出正则验证过后 去除换行符等一些不需要的元素 返回的数组 "{{ name }}" "name" 需要索引为1的值 不需要{{}}
			const result_regex = pattern.exec(node.nodeValue);
      // console.log(result_regex);
			if (result_regex) {
				// console.log(vm.$data[result_regex[1]]);
				const arr = result_regex[1].split('.');
				//reduce迭代累加器 遍历arr数组 total[current] 不断地迭代的链式获取最终的值 ，reduce两个参数 ， 第一个参数是个回调函数，第二参数vm.$data是初始值，total的初始值
				const value = arr.reduce(
					(total, current) => total[current],
					vm.$data
				);
				//将 {{name}}  {{more.age}} 替换成value
				node.nodeValue = temp.replace(pattern, value);
				//文档碎片替换的时候添加创建订阅者
				new Watcher(vm, result_regex[1], newValue => {
          //wacther的回调函数 会将文档碎片中的nodevalue更新为我们修改的newValue
					node.nodeValue = temp.replace(pattern, newValue);
				});
			}
			return;
		}
    //找v-model属性的元素 更改其nodeValue
    if(node.nodeType === 1 && node.nodeName === 'INPUT'){
      const attr = Array.from(node.attributes)
      attr.forEach(item => {
        if(item.nodeName === 'v-model'){
          // console.log(item.nodeValue);
          //修改nodeValue
          const value = item.nodeValue.split('.').reduce((total, current) => total[current], vm.$data)
          // console.log(value);
          node.value = value
          //创建watcher实例
          new Watcher(vm, item.nodeValue, newValue => {
            node.value = newValue
          })
          //触发input事件来通过视图修改数据
          node.addEventListener('input', e => {
            const arr1 = item.nodeValue.split('.')
            // console.log(arr1);
            const arr2 = arr1.slice(0, arr1.length - 1)
            const final = arr2.reduce((total, current) => total[current], vm.$data)
            // console.log(final);
            final[arr1[arr1.length - 1]] = e.target.value
          })
        } 
      })
    }
		//递归遍历
		node.childNodes.forEach((child) => fragment_compile(child));
	}
	//将文档碎片 fragment渲染到el中
	vm.$el.appendChild(fragment);
}

//依赖 --收集和通知订阅者
class Dependency {
	constructor() {
		//收集订阅者
		this.subscribers = [];
	}
	//添加订阅者
	addSub(sub) {
		this.subscribers.push(sub);
	}
	//通知订阅者
	notify() {
		//遍历订阅者 让订阅者触发自己的update函数
		this.subscribers.forEach((sub) => sub.update());
	}
}

//订阅者
class Watcher {
	//三个参数
	constructor(vm, key, callback) {
		this.vm = vm;
		this.key = key;
		this.callback = callback;
		//临时属性 --触发getter
    //因为想要将watcher实例添加到依赖的数组中
		Dependency.temp = this;
    //触发getter时候 将订阅者实例添加到订阅者数组中
    key.split('.').reduce((total, current) => total[current], vm.$data  )
    //避免多次重复添加到订阅者数组中
    Dependency.temp = null
	}
	//更新函数
	update() {
    //获取属性值
    const value = this.key.split('.').reduce((total, current) => total[current], this.vm.$data  )
		this.callback(value);
	}
}
