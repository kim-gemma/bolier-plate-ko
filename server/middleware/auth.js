const { User } = require("../models/User");

let auth = (req, res, next) => {
    // 인증처리하는 곳

    // 1. client cookie에서 token을 가져옴
    let token = req.cookies.x_auth;

    // 2. decode token with JWT > 유자 찾기 
    //복호화(decryption)는 암호화된 데이터를 암호화되기 전의 형태로 바꾸는 처리를 말한다. 복호화는 암호화(encryption, 인크립션)의 반대말로서 영어로 decryption(디크립션)이라고 부른다. 복호화는 디코딩(decoding)과 유사
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json( {isAuth: false, error: true} ); // 4. 유저가 없으면 인증 no!

        // 3. 유저가 있으으면 인증 ok
        // req에 넣어주는 이유는 router에서 사용 할 수 있도록
        req.token = token;
        req.user = user;
        next(); // middleware에서 계속 갈 수 있도록, 없으면 middleware에서 갇힘
    });
}

//다른파일에서 쓸 수 있게 exports
module.exports = { auth };
