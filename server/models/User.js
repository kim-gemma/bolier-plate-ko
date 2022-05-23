const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
 
// DB Schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // remove space
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})


// mongoose method > before saving in the register route, callback 'bycryt'
userSchema.pre('save', function (next) {
    var user = this; // = userSchema

    if (user.isModified('password')) { // 비밀번호 수정 시
        //비밀번호를 암호화 www.npmjs.com/package/bcrypt
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            // salt 생성 성공 > hash(plain passwrod, salt, callback(err, hased pw))
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);

                user.password = hash; // user password를 hashed password로 교체
                next();
            })
        })
    } else { // 다른거 수정 시
        next();
    }
});

// 비밀번호 일치 확인
userSchema.methods.comparePassword = function(plainPassword, callback) {
    //plainPassword : 1234567 = hashed password 
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return callback(err);
        // =
        callback(null, isMatch);
    })
}

// 비밀번호가 일치한다면, token 생성
userSchema.methods.generateToken = function(cb) {
    var user = this; //es5

    /// jwt, jsonwebtoken을 이용해서, token 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken') 
    //  user._id( = mongoDB _id) + secretToken -> 'secretToken' => user._id 찾을 수 있음

    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    })
}

// auth
userSchema.statics.findByToken = function(token, cb) {
    var user = this;
  
    // 토큰 디코드 
    jwt.verify(token, 'secretToken', function(err, decode) {
        // 유저 아이디를 이용해 유저 찾기 
        user.findOne({ "_id" : decode, "token" : token }, function(err, user) {
            if(err) return cb(err);
            cb(null, user);
        });
        // 클라이언트에서 가져온 토큰과 DB에 보관된 토큰을 비교
    });
  }

// module is covering schema
const User = mongoose.model('User', userSchema)
// to use as a global
module.exports = {
    User
}