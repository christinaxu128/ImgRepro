const express = require("express");

module.exports = (imagesStore, usersStore) => {
  let router = express.Router();

  const storeUploadedImageFile = async (imageFile, username, public) => {
    await imagesStore.insert({
      name: imageFile.name,
      data: imageFile.data.toString("base64"),
      size: imageFile.size,
      username: username,
      public,
    });
    console.log("Uploaded image " + imageFile.name);
  };

  const deleteImage = async (imageID, username) => {
    const metadata = imagesStore.getMetadata(imageID);
    if (metadata.username !== username) {
      throw new Error("Username doesn't match");
    }
    await imagesStore.delete(imageID, username);
  };

  const getAllImageMetadatas = async (username) => {
    console.log("Getting images for " + username);
    return await imagesStore.listMetadataByUsername(username);
  };

  const getAllPublicImageMetadatas = async (username) => {
    console.log("Getting public images not by " + username);
    return await imagesStore.listPublicMetadata(username);
  };

  router.get("/", async (req, res) => {
    if (await usersStore.isCorrectLoginID(req)) {
      const images = await getAllImageMetadatas(req.cookies.username);
      const publicImages = await getAllPublicImageMetadatas(
        req.cookies.username
      );
      console.log("Get images " + images);
      res.render("all_images", { images, publicImages, username: req.cookies.username });
    } else {
      res.render("error", { err: "Not authenticated" });
    }
  });

  router.get("/upload", async (req, res) => {
    if (await usersStore.isCorrectLoginID(req)) {
      res.render("upload_image");
    } else {
      res.render("/error");
    }
  });

  router.post("/upload", async (req, res) => {
    if ((await usersStore.isCorrectLoginID(req)) && req.files.image) {
      await storeUploadedImageFile(
        req.files.image,
        req.cookies.username,
        req.body.public === "on"
      );
      res.redirect("/images");
    } else {
      res.redirect("/upload");
    }
  });

  router.post("/delete/:imageID", async (req, res) => {
    if (await usersStore.isCorrectLoginID(req)) {
      await deleteImage(req.params.imageID, req.cookies.username);
      res.redirect("/images");
    } else {
      res.render("error", { err: "Not authenticated" });
    }
  });

  router.get("/:imageID", async (req, res) => {
    const metadata = await imagesStore.getMetadata(req.params.imageID);
    try {
      if (!metadata.public) {
        if (req.cookies.username != metadata.username) {
          throw new Error("Username doesn't match");
        }
        if (!(await usersStore.isCorrectLoginID(req))) {
          throw new Error("Login expired");
        }
      }
      console.log("Getting image of " + req.params.imageID);
      let image = await imagesStore.get(
        req.params.imageID,
        req.cookies.username
      );
      res.render("view_image", { image });
    } catch (err) {
      res.render("error", {err});
    }
  });

  return router;
};
