const express = require("express");
const { render } = require("../app");

module.exports = (imagesStore, usersStore) => {
  let router = express.Router();

  const isCorrectLoginID = async (req) => {
    const loginID = req.cookies.loginID;
    const username = req.cookies.username;
    console.log(loginID, username);
    return (await usersStore.find(username)).loginID == loginID;
  };

  const uploadImageFile = async (imageFile, username) => {
    await imagesStore.insert({
      name: imageFile.name,
      data: imageFile.data.toString("base64"),
      size: imageFile.size,
      username: username,
    });
    console.log("Uploaded image " + imageFile.name);
  };

  const getAllImageMetadatas = async (username) => {
    console.log("Getting images for " + username);
    return await imagesStore.listMetadataByUsername(username);
  };

  router.get("/", async (req, res) => {
    if (isCorrectLoginID(req)) {
      const images = await getAllImageMetadatas(req.cookies.username);
      console.log("Get images " + images);
      res.render("all_images", { images });
    } else {
      res.render("error", { err: "Not authenticated" });
    }
  });

  router.get("/upload", (req, res) => {
    if (isCorrectLoginID(req)) {
      res.render("upload_image");
    } else {
      res.render("/error");
    }
  });

  router.post("/upload", async (req, res) => {
    if (isCorrectLoginID(req) && req.files.image) {
      await uploadImageFile(req.files.image, req.cookies.username);
    } else {
      res.redirect("/upload");
    }
  });

  router.get("/:imageID", async (req, res) => {
    try {
      let image = await imagesStore.get(
        req.params.imageID,
        req.session.username
      );
      res.render("single_image", image);
    } catch (err) {
      res.render("error_image", err);
    }
  });

  return router;
};
