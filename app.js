const express = require('express');
const app = express();

const qs = require('qs');
const morgan = require('morgan');
const cors = require('cors')
const axios = require('axios')
const server = require('http').Server(app);
const port = (process.env.PORT || 3001);
var io = require('socket.io')(server,
  {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
server.listen(port, () => console.log('Server running in port ' + port));

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
if(process.env.NOTE_ENV === 'dev'){
  app.use(morgan('combined'));
}
app.get('/', (req, res) => {
  res.send('HelloU');
})
var download = function(url, cb) {
  axios
      .get(url, {
          responseType: 'arraybuffer'
      })
      .then(response => {
          const buffer = Buffer.from(response.data, 'binary').toString('base64');
          cb(`data:audio/ogg;base64,${buffer}`)
      })
      .catch(ex => {
          console.error(ex);
      });
}
io.on('connection', function(socket){
  console.log('socket', socket.id);
  //kết nối với socket
  
  //đã kết nối

  //bắt đầu đọc
  app.post('/emit', (req, res) => {
    let element = req.body
    console.log('element', element);
    element.forEach(async el => {
      if(el.room){
        if(el.type === 'donate'){
          if(el.test){
            el.data.description_audio_url = 'https://chunk.lab.zalo.ai/55928b0fcb5622087b47/55928b0fcb5622087b47'
          }else{
            res = await axios({
              method: 'post',
              url: 'https://api.zalo.ai/v1/tts/synthesize',
              data: qs.stringify({
                input: el.data.description,
              }),
              headers: {
                apikey: "nON9ynVPbi42VSgLMLyUnByy7kgRDfff",
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
              }
            })
            
            if(res.data.error_code === 0){
              el.data.description_audio_url = res.data.data.url
            }
          }
        }
        io.to(el.room).emit('new_comment', {
          data: el.data
        });
      }
    });
    
    res.json("OK")
  })
  socket.on('join room', function (data){
    //id, socket io
    let roomname = data.id
    console.log('room', roomname);
    socket.join(roomname);
  })
});

    
