const cloudStorage = require("@google-cloud/storage");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const ffmpeg = require("ffmpeg");
const os = require("os");
const path = require("path");

exports.onAudioBlobUploaded = functions.storage.object().onFinalize(object => {
	console.log("=== onAudioBlobUploaded triggered ===");
	if (object.contentType != "application/octet-stream") {
		console.log(
			"Triggered by file with where contentType != application/octet-stream. EXITING"
		);
		return;
	}
	var bucket = object.bucket;
	const filePath = object.name;
	const destBucket = admin.storage().bucket(bucket);
	const tmpFilePath = path.join(os.tmpdir(), path.basename(filePath));
	const metadata = { contentType: "audio/mp3" };
	return destBucket
		.file(filePath)
		.download({
			destination: tmpFilePath
		})
		.then(() => {
			console.log(`this is the tmpFilePath: ${tmpFilePath}`);

			var process = new ffmpeg(tmpFilePath);
			console.log(`This is the process..`);
			console.log(process);
			return process.then(audio => {
				console.log("INSIDE process.then: this is the audio:");
				console.log(audio);
				var newPath = "/tmp/audio.mp3";
				return audio.fnExtractSoundToMP3(newPath, function(error, file) {
					if (!error) {
						console.log(`New audio file path: ${file}`);
					}
				});
			});
		})
		.then(() => {
			return destBucket.upload(tmpFilePath, {
				destination: filePath,
				metadata: metadata
			});
		});
});
