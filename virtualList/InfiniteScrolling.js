
// 滚动条版本
class InfiniteScrolling {
	constructor(el, load, opt) {
		this.preStartN = 10
		this.preEndN = 10
		this.canche = []  // 缓存列表
		this.sPos = 0    // 显示开始位置
		this.ePos = 0    // 显示结束位置
		this.prePad = 0  // 开始位置填充大小
		this.endPad = 0  // 结束位置填充大小
		this.scrollTop = 0
		this.scrollBottom = 0
		this.el = el
		this.load = load
		this.opt = opt
		this.init()
	}
	async init () {
		this.el.innerHTML = `<div class="startBlock"></div><div class="list"></div><div class="endBlock"></div>`
		this.list = this.el.querySelector('.list')
		this.startBlock = this.el.querySelector('.startBlock')
		this.endBlock = this.el.querySelector('.endBlock')
		await this.getList()
		this.el.addEventListener('scroll', this.throttle(this.callback, 50), false)
	}
	throttle (func, delay) {
		const context = this
		var timer = null;
		var startTime = Date.now();  //设置开始时间
		return function () {
			var curTime = Date.now();
			var remaining = delay - (curTime - startTime);  //剩余时间
			var args = arguments;
			clearTimeout(timer);
			if (remaining <= 0) {      // 第一次触发立即执行
				func.apply(context, args);
				startTime = Date.now();
			} else {
				timer = setTimeout(func.bind(context), remaining);   //取消当前计数器并计算新的remaining
			}
		}
	}
	async getList () {
		await this.loadList()
		if (this.list.offsetHeight <= this.el.offsetHeight) {
			await this.getList()
		}
	}
	async loadList () {
		const list = await this.load(this.canche.length)
		const startIndex = this.list.childNodes.length
		let str = this.list.innerHTML
		list.forEach(li => {
			str += li
		})
		this.list.innerHTML = str
		list.forEach((li, i) => {
			this.canche.push({
				str: li,
				height: this.list.childNodes[startIndex + i].offsetHeight
			})
		})
	}
	setPadding () {
		this.setStartPos()
		this.setEndPos()
		this.startBlock.style.height = this.prePad + 'px'
		this.endBlock.style.height = this.endPad + 'px'
		let str = ''
		for (let i = this.sPos; i <= this.ePos; i++) {
			str += this.canche[i].str
		}
		this.list.innerHTML = str
		this.el.scrollTop = this.scrollTop
	}
	setStartPos () {
		const height = this.el.scrollTop
		let h = 0
		for (let i = 0; i < this.canche.length; i++) {
			h += this.canche[i].height
			if (h >= height) {
				if (i <= this.preStartN) {
					this.sPos = 0
					this.prePad = 0
				} else {
					this.sPos = i - this.preStartN
					let preH = 0
					for (let j = 0; j <= this.preStartN; j++) {
						preH += this.canche[i - j].height
					}
					this.prePad = h - preH
				}
				break;
			}
		}
	}
	setEndPos () {
		const height = this.scrollBottom
		const len = this.canche.length - 1
		let h = 0
		this.ePos = len
		for (let i = len; i >= 0; i--) {
			h += this.canche[i].height
			if (h >= height) {
				if (i >= len - this.preEndN) {
					this.ePos = len
					this.endPad = 0
				} else {
					this.ePos = i + this.preEndN
					let preH = 0
					for (let j = 0; j <= this.preEndN; j++) {
						preH += this.canche[i - j].height
					}
					this.endPad = h - preH
				}
				break;
			}
		}
	}
	callback () {
		this.scrollTop = this.el.scrollTop
		this.scrollBottom = this.el.scrollHeight - this.el.clientHeight - this.el.scrollTop
		if (this.scrollBottom <= 2) {
			this.loadList()
		}
		if (this.prePad >= this.scrollTop || this.endPad >= this.scrollBottom) {
			this.setPadding()
		}

	}
}

