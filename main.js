const request = require('request');
const player = require('play-sound')();
const keypress = require('keypress');
const { volume } = require('node-audio-linux');

const dir = '/home/zilong/node/alarmClock';
// 获取系统音量 方法
const { getVolume,setVolume, isMuted, setMute } = volume;
// 获取音量
const muted = isMuted();
const defaultVolume = getVolume().toFixed(2);
// 获取现在时间
const date = new Date()
const ms = date.getTime();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const week = date.getDay();
const formatDate = `${year}-${month}-${day}`;
// console.log(formatDate);
// console.log(date, ms, year, month);
//定义百度接口链接

const url = `https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=${year}年${month}月&co=&resource_id=6018&t=${ms}&&format=json`;
const encodeUrl = encodeURI(url);

// 请求接口 获取今天是否上班
request(encodeUrl,(err,respones,body) => {
  if (!err && respones.statusCode === 200) {
    const dataObj = JSON.parse(body);
    const data = dataObj.data[0];
    const { holiday = [] } = data;
    let dateFlag = false;
    let xiuxi = false;
    holiday.forEach(item => {
      // const _month = item.festival.split('-')[1]
      item.list.forEach(day => {
        if (day.date === formatDate) { 
          dateFlag = true;
          if (day.status === '1') {
            xiuxi = true;
          }
        }
      })
    })
    
    if (dateFlag) { // 假期里面上班的 包含休息和调休加班
      if (xiuxi) {
        // 休息
        console.log('xx');
        process.exit();

      } else {
        // 加班
        ring();
        console.log('jb');
        // 设置定时 即 当铃声播放完毕后继续重复播放 直到按下空格停止，并终止程序
        this.timer = setInterval(ring, 40100)
        // 超过5分钟停止
        setTimeout(() => { process.exit()}, 300000)
      }
    } else {
      if ([6,0].indexOf(week) > -1) { // 判断是都为周末
        // 休息
        console.log('xxweek');
        process.exit();
      } else {
        //上班
        ring();
        console.log('shangban');
        // 设置定时 即 当铃声播放完毕后继续重复播放 直到按下空格停止，并终止程序
        this.timer = setInterval(ring, 40100)
        // 超过5分钟停止
        setTimeout(() => { process.exit()}, 300000)
      }
    }
    
  }
});



// 设置铃声并播放
const ring = () => {
// 设置非静音 并设置音量大小
  setMute(false);
  setVolume(0.80);
  this.alarm = player.play(dir+'/ring/fellforu.mp3',function(err) {
    if (err){
      throw err
    }
  });
}
// ring();

// 设置键盘事件 当按下空格建时停止闹钟，并退出程序；
keypress(process.stdin);
process.stdin.on('keypress',(ch,key) => {
  if (key && key.name === 'space') {
    clearInterval(this.timer)
    this.alarm.kill();
    setVolume(defaultVolume);
    setMute(muted); 
    process.exit();
  }
})
process.stdin.setRawMode(true);
// process.stdin.resume();



