const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./models/user");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
// 몽고디비의 저장소에 접근을 해서 저장하고 그 정보를 불러와주는 웹 서비스

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/users/register", async (req, res) => {
  //body Parser를 통해 body에 담긴 정보를 가져옴
  const user = new User(req.body);

  //mongoDB 메서드, user모델에 저장
  const result = await user;
  try {
    user
      .save()
      .then(() => {
        return res.status(200).json({
          success: true,
        });
      })
      .catch((err) => {
        return res.json({ success: false, err });
      });
  } catch {
    console.log(err);
  }
});

app.post("/login", (req, res) => {
  try {
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.json({
            loginSuccess: false,
            message: "제공된 이메일에 해당하는 유저가 없습니다",
          });
        }

        //요청된 이메일이 데이터베이스에 있다면 요청된 비밀번호가 맞는 비밀번호 인지 확인

        user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch)
            return res.json({
              loginSuccess: false,
              messsage: "비밀번호가 틀렸습니다",
            });

          // 비밀번호까지 맞다면 토큰을 생성하자
          user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);

            //토큰을 저장한다, 쿠키 or 로컬스토리지
            res
              .cookie("x_auth", user.token)
              .status(200)
              .json({ loginSuccess: true, userId: user._id });
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
});

app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
