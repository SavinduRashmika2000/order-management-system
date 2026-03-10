package savindu_rashmika.order.management.system.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private final Cloudinary cloudinary;

    /**
     * Uploads a Base64 image string to Cloudinary.
     *
     * @param base64Image The Base64 encoded image string.
     * @param folder      The folder name in Cloudinary (e.g., "products",
     *                    "customers").
     * @return The secure URL of the uploaded image.
     * @throws IOException If the upload fails.
     */
    public String uploadImage(String base64Image, String folder) throws IOException {
        if (base64Image == null || !base64Image.contains(",")) {
            return null;
        }

        Map uploadResult = cloudinary.uploader().upload(base64Image, ObjectUtils.asMap(
                "folder", folder));

        return (String) uploadResult.get("secure_url");
    }

    /**
     * Uploads a MultipartFile to Cloudinary.
     *
     * @param file   The MultipartFile to upload.
     * @param folder The folder name in Cloudinary.
     * @return The secure URL of the uploaded image.
     * @throws IOException If the upload fails.
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder));

        return (String) uploadResult.get("secure_url");
    }
}
