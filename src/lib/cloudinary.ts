// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name : process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key    : process.env.CLOUDINARY_API_KEY!,
  api_secret : process.env.CLOUDINARY_API_SECRET!,
})

export default cloudinary

/**
 * Upload a file buffer/base64 to Cloudinary
 */
export async function uploadToCloudinary(
  source: string,   // base64 data URI or URL
  folder = 'glow-medical',
  publicId?: string,
) {
  return cloudinary.uploader.upload(source, {
    folder,
    ...(publicId && { public_id: publicId }),
    resource_type: 'auto',
    overwrite    : true,
  })
}

/**
 * Delete an asset from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}
