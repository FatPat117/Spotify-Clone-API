const express = require("express");
const { protect, isAdmin } = require("../middlewares/auth");
const playlistController = require("../controllers/playlistController");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public routes
router.get("/", playlistController.getPlaylists);
router.get("/:id", playlistController.getPlaylistById);
router.get("/user/me", protect, playlistController.getUserPlaylists);
router.get("/featured", playlistController.getFeaturedPlaylists);
// Admin routes
router.post("/", protect, isAdmin, upload.single("coverImage"), playlistController.createPlaylist);
router.put("/:id", protect, isAdmin, upload.single("coverImage"), playlistController.updatePlaylist);
router.put("/:playlistId/add-songs", protect, playlistController.addSongToPlaylist);
router.put("/:playlistId/remove-song/:songId", protect, playlistController.removeSongFromPlaylist);
router.put("/:playlistId/add-collaborator", protect, playlistController.addCollaboratorToPlaylist);
router.put("/:playlistId/remove-collaborator", protect, playlistController.removeCollaboratorFromPlaylist);
router.delete("/:id", protect, isAdmin, playlistController.deletePlaylist);

module.exports = router;
