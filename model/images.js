const mongoose = require("mongoose");

class ImagesMongoDB {
  static #schema = new mongoose.Schema({
    name: String,
    data: String,
    size: Number,
    username: String,
    public: Boolean,
  });

  static Image = mongoose.model("Image", this.#schema);

  async insert(image) {
    return await ImagesMongoDB.Image.create(image);
  }

  async listMetadataByUsername(username) {
    console.debug(`Finding images for ${username}`);
    return await ImagesMongoDB.Image.find(
      { username },
      "name size username _id"
    ).exec();
  }

  async listPublicMetadata(username) {
    return await ImagesMongoDB.Image.find(
      { username: { $ne: username }, public: true },
      "name size username _id"
    ).exec();
  }

  async get(imageID) {
    return await ImagesMongoDB.Image.findOne({
      _id: mongoose.Types.ObjectId(imageID),
    }).exec();
  }

  async getMetadata(imageID) {
    return await ImagesMongoDB.Image.findOne(
      { _id: mongoose.Types.ObjectId(imageID) },
      "name size username public _id"
    ).exec();
  }

  async delete(imageID) {
    return await ImagesMongoDB.Image.deleteOne({
      _id: mongoose.Types.ObjectId(imageID),
    }).exec();
  }
}

module.exports = {
  ImagesMongoDB,
};
