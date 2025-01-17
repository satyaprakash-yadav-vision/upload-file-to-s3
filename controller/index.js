const { Upload } = require("@aws-sdk/lib-storage")
const { s3 } = require("../config")

// upload file to s3 parallelly in chunks
module.exports.uploadFileController = async (req, res) => {
	const file = req.file
	// params for s3 upload
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		Key: `other/${file.originalname}`,
		Body: file.buffer,
	}

	try {
		// upload file to s3 parallelly in chunks
		// it supports min 5MB of file size
		const uploadParallel = new Upload({
			client: s3,
			queueSize: 4, // optional concurrency configuration
			partSize: 5542880, // optional size of each part
			leavePartsOnError: false, // optional manually handle dropped parts
			params,
		})

		// checking progress of upload
		uploadParallel.on("httpUploadProgress", progress => {
			console.log(progress)
		})

		// after completion of upload
		uploadParallel.done().then(data => {
			const response= {detail:[{file:data.Location}]};
			res.send(response)
		})
	} catch (error) {
		res.send({
			success: false,
			message: error.message,
		})
	}
}
