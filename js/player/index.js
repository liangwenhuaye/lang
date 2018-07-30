import Sprite   from '../base/sprite'
import Bullet   from './bullet'
import DataBus  from '../databus'

const screenWidth    = window.innerWidth
const screenHeight   = window.innerHeight

// 玩家相关常量设置
const PLAYER_IMG_SRC = 'images/head.png'
const ENEMY_WIDTH   =  20
const PLAYER_WIDTH   = 20
const PLAYER_HEIGHT  = 20
const _SPEED_ = 2
const _ANGLE_ = Math.PI/30

let databus = new DataBus()

export default class Player extends Sprite {
  constructor() {
    super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT)

    // 玩家默认处于屏幕底部居中位置
    this.x = screenWidth / 2 - this.width / 2
    this.y = screenHeight/2 - this.height - 30

    this.rotate = Math.PI/2
    this.touchSide = 0 //1 left 2 right

    // 用于在手指移动的时候标识手指是否已经在飞机上了
    this.touched = false

    this.bullets = []
    this.positions = []
    this.weiba = 1
    this.speed = _SPEED_

    // 初始化事件监听
    this.initEvent()
  }

  /**
   * 当手指触摸屏幕的时候
   * 判断手指是否在飞机上
   * @param {Number} x: 手指的X轴坐标
   * @param {Number} y: 手指的Y轴坐标
   * @return {Boolean}: 用于标识手指是否在飞机上的布尔值
   */
  checkIsFingerOnAir(x, y) {
    const deviation = 30

    return !!(   x >= this.x - deviation
              && y >= this.y - deviation
              && x <= this.x + this.width + deviation
              && y <= this.y + this.height + deviation  )
  }

  /**
   * 根据手指的位置设置飞机的位置
   * 保证手指处于飞机中间
   * 同时限定飞机的活动范围限制在屏幕中
   */
  setAirPosAcrossFingerPosZ(x, y) {
    let disX = x - this.width / 2
    let disY = y - this.height / 2

    if ( disX < 0 )
      disX = 0

    else if ( disX > screenWidth - this.width )
      disX = screenWidth - this.width

    if ( disY <= 0 )
      disY = 0

    else if ( disY > screenHeight - this.height )
      disY = screenHeight - this.height

    this.x = disX
    this.y = disY
  }

  /**
   * 玩家响应手指的触摸事件
   * 改变战机的位置
   */
  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      if (x > screenWidth/2)
        this.touchSide = 2
      else
        this.touchSide = 1
      //
      // if ( this.checkIsFingerOnAir(x, y) ) {
      //   this.touched = true

      //   this.setAirPosAcrossFingerPosZ(x, y)
      // }

    }).bind(this))

    canvas.addEventListener('touchmove', ((e) => {
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      // if ( this.touched )
      //   this.setAirPosAcrossFingerPosZ(x, y)

    }).bind(this))

    canvas.addEventListener('touchend', ((e) => {
      e.preventDefault()

      // this.touched = false
      this.touchSide = 0
    }).bind(this))
  }

  /**
   * 玩家射击操作
   * 射击时机由外部决定
   */
  shoot() {
    let bullet = databus.pool.getItemByClass('bullet', Bullet)

    bullet.init(
      this.x + this.width / 2 - bullet.width / 2,
      this.y - 10,
      10
    )

    databus.bullets.push(bullet)
  }

  update() {
    if (this.touchSide == 1)
      this.rotate -= _ANGLE_
    else if(this.touchSide == 2)
      this.rotate += _ANGLE_
      
    if (this.rotate > Math.PI)
    {
      this.rotate = this.rotate - 2*Math.PI
    } else if (this.rotate < -Math.PI)
    {
      this.rotate = 2 * Math.PI + this.rotate
    }
    
    this.x += _SPEED_ * Math.cos(this.rotate)
    this.y += _SPEED_ * Math.sin(this.rotate)

    this.positions.unshift({x:this.x, y:this.y})

    let shouldLen = Math.floor(ENEMY_WIDTH/_SPEED_) * this.weiba

    for (let i = 0, il = this.positions.length - shouldLen; i < il;i++)
    {
      this.positions.pop()
    }
    
    if (this.y >= window.innerHeight - this.height || this.y <= 0)
      this.rotate = - this.rotate
    if (this.x >= window.innerWidth - this.width || this.x <= 0)
    {
      if (this.rotate >= 0)
        this.rotate = Math.PI - this.rotate
      else
        this.rotate = - this.rotate - Math.PI
    }
  }
}
