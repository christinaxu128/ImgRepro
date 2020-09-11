const mongoose = require("mongoose");

class ImagesMongoDB {
  static #schema = new mongoose.Schema({
    name: String,
    data: String,
    size: Number,
    username: String,
  });

  static Image = mongoose.model("Image", this.#schema);

  async insert(image) {
    return await ImagesMongoDB.Image.create(image);
  }

  async listMetadataByUsername(username) {
    console.log(`Finding images for ${username}`);
    return await ImagesMongoDB.Image.find(
      { username },
      "name size username _id"
    ).exec();
  }

  async get(imageID, username) {
    await ImagesMongoDB.Image.findOne({ username, _id: imageID }).exec();
  }
}

module.exports = {
  ImagesMongoDB,
};
