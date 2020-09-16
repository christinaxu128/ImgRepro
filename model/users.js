const mongoose = require("mongoose");

class UsersMemStore {
  #userMaps = new Map();

  async insert(user) {
    return new Promise((res, rej) => {
      this.#userMaps.set(user.name, user);
      console.log(`Inserted user ${user}`);
      res();
    });
  }

  async find(username) {
    return new Promise((res, rej) => {
      res(this.#userMaps.get(username));
    });
  }

  async updateLoginID(username, loginID) {
    return new Promise((res, rej) => {
      this.#userMaps.get(username).loginID = loginID;
      res();
    });
  }
}

class UsersMongoDB {
  static schema = new mongoose.Schema({
    name: String,
    hash: String,
    salt: String,
    loginID: String,
  });

  static User = mongoose.model("User", this.schema);

  async insert(user) {
    let newUser = new UsersMongoDB.User(user);
    await newUser.save();
  }

  async find(username) {
    return await UsersMongoDB.User.findOne({ name: username }).exec();
  }

  async updateLoginID(username, loginID) {
    console.debug(`Updating login ID ${loginID} for ${username}`);
    await UsersMongoDB.User.updateOne({ name: username }, { loginID });
  }

  async isCorrectLoginID(req) {
    const loginID = req.cookies.loginID;
    const username = req.cookies.username;
    if (!loginID || !username) {
      return false;
    }
    console.debug(`Checking log in ID ${loginID} for ${username}`);
    return (await this.find(username)).loginID == loginID;
  }
}

module.exports = {
  UsersMemStore,
  UsersMongoDB,
};
