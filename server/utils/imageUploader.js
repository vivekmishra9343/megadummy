const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudianry = async (file, folder, height, quality) => {
  const options = { folder };
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";
  return await cloudinary.uploader.upload(file.tempFilepath, options);
};
