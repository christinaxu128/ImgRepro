const express = require("express")
const { render } = require("../app")

const router = express.Router()
router.get("/", (req, res) => {
  render("error");
})