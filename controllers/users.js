var express = require("express");
var hash = require("pbkdf2-password")();
var { v4: uuidV4 } = require("uuid");

module.exports = (usersStore) => {
  const createUser = async (username, password) =>
    new Promise((res, rej) => {
      hash({ password }, function (err, pass, salt, hash) {
        if (err) {
          throw rej(err);
        }
        usersStore.insert({ name: username, hash, salt }).then(res);
      });
    });

  const userAlreadyExists = async (username) => {
    return (await usersStore.find(username)) != null;
  };

  const compareHash = async (password, salt) => {
    return new Promise((res, rej) => {
      hash({ password, salt }, function (err, p, s, h) {
        if (err) return rej(err);
        if (salt == s) {
          res(h);
        }
        rej(new Error("Invalid passowrd"));
      });
    });
  };

  const authenticate = async (username, password) => {
    let user = await usersStore.find(username);
    if (!user) {
      return fn(new Error("Cannot find user " + username));
    }
    await compareHash(password, user.salt);
    const newLoginID = uuidV4();
    await usersStore.updateLoginID(username, newLoginID);
    user.loginID = newLoginID;
    return user;
  };

  let router = express.Router();
  router.get("/", (req, res, next) => {
    res.send("respond with a resoure");
  });

  router.get("/create", (req, res) => {
    res.render("create");
  });

  router.post("/create", async (req, res) => {
    if (await userAlreadyExists(req.body.username)) {
      res.send("username already exists");
      return;
    }
    await createUser(req.body.username, req.body.password);
    res.redirect("/images");
  });

  router.get("/login", (req, res) => {
    if (req.session && req.session.error) {
      res.render("login", { err: req.session.error });
    } else {
      res.render("login");
    }
  });

  router.get("/logout", async (req, res) => {
    if (await usersStore.isCorrectLoginID(req)) {
      res.clearCookie("loginID");
      res.clearCookie("username");
      res.redirect("login");
    } else {
      res.redirect("/error", { err: "Not authorized" });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      let user = await authenticate(req.body.username, req.body.password);
      req.session.regenerate(function () {
        req.session.user = user;
        req.session.error = undefined;
        req.session.success =
          "Authenticated as " +
          user.name +
          ' click to <a href="/logout">logout</a>. ' +
          ' You may now access <a href="../images">/images</a>.';
        res.redirect("/images");
      });
      res.cookie("loginID", user.loginID);
      res.cookie("username", user.name);
    } catch (err) {
      req.session.error =
        "Authenticate failed, please check your username and password";
      console.log("Authenticate failed: " + err);
      res.redirect("login");
    }
  });

  return router;
};
