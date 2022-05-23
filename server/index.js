const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose
.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch((e) => console.log('MongoDB error: ', e));

app.get('/', (req, res) => {
  res.send('Hello World! 새해복')
})

app.get('/api/hello', (req,res) => {
    res.send('안녕하세요~')
})

// register router
app.post('/api/users/register', (req, res)=>{
  // 회원가입 시, 필요한 정보를 client에서 가져오면 DB에 넣어준다.
  
  // req.body 안에는 JSON 형식으로 데이터가 들어옴
  const user = new User(req.body)

  // mongoDB method
  user.save((err, userInfo) => {
      if(err) return res.json({ success : false, err})
      return res.status(200).json({
          success : true
      })
  })
})

app.post('/api/users/login', (req, res) => {
  // 1. 요청된 이메일을 데이터 베이스에서 있는지 확인
  User.findOne({ email: req.body.email }, (err, user) => {
      if(!user) {
          return res.json({
              loginSuccess: false,
              message: "제공된 이메일에 해당되는 유저가 없습니다."
          })
      }

  // 2. 요청된 이메일이 있다면, 비밀번호가 동일한지 확인
      user.comparePassword(req.body.password, (err,isMacth) => {
          if(!isMacth) {
              return res.json({
                  loginSuccess: false,
                  message: "비밀번호가 틀렸습니다."
              })
      
          }
  // 3. 비밀번호까지 같으면 해당 유저를 위한 token 생성         
          user.generateToken((err, user) => {
              if(err) return res.status(400).send(err);
              //400은 애러, 200은 성공
              // token을 저장, 어디에? 쿠키, 로컬스토리지, 세션 등에 저장 
              res.cookie("x_auth", user.token)
              .status(200)
              .json( { loginSuccess: true, userId: user._id } )

          })

      })
  
  });

})

// auth route
app.get('/api/users/auth', auth, (req, res) => {
  // auth = middleware, 여기까지 미들웨어를 통과했다는 말은 Authentication = True!
  res.status(200).json({
      _id: req.user._id,
      //0이면 false
      //role 0 ->  일반유저 role 0 이 아니면 관리자
      //role 1 ->  어드민 role2특정부서 어드민
      isAdmin: req.user.role === 0? false : true, 
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image
  })
})

// logout route
//로그인 된 상태니까 auth middleware 넣어줌
app.get('/api/users/logout', auth, (req, res) => {
  // mongoose method
  //findOneAndUpdate 토큰만 없애줌 findByIdAndRemove 데이터 기록 삭제로 쓰기
  User.findByIdAndRemove({_id: req.user._id}, 
      {token: ""}, (err, user) => {
          if(err) return res.json({success: false, err});

          return res.status(200).send({
              success: true
          })
      })
})

const port = 5000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})