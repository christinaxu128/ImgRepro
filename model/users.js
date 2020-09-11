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
    })
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
    await UsersMongoDB.User.updateOne({ username }, { loginID });
  }
}

module.exports = {
  UsersMemStore,
  UsersMongoDB,
};
