var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var fileUpload = require("express-fileupload");
var mongoose = require("mongoose");

var indexRouter = require("./controllers/index");
var buildUsersRouter = require("./controllers/users");
var buildImagesRouter = require("./controllers/images");

var { UsersMemStore, UsersMongoDB } = require("./model/users");
var { ImagesMongoDB } = require("./model/images");

mongoose.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true });

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "aa123454b01l;dv2vdrgrlknv1m",
  })
);
app.use(fileUpload());

const usersStore = new UsersMongoDB();
const imagesStore = new ImagesMongoDB();

app.use("/", indexRouter);
app.use("/users", buildUsersRouter(usersStore));
app.use("/images", buildImagesRouter(imagesStore, usersStore));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {err: err});
});

module.exports = app;
