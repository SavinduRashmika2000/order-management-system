package savindu_rashmika.order.management.system.services;

import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String uploadDir = "uploads";

    public String saveImage(String base64Image, String subFolder) throws IOException {
        if (base64Image == null || !base64Image.contains(",")) {
            return null;
        }

        // Create directories if they don't exist
        File directory = new File(uploadDir + File.separator + subFolder);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Extract base64 content
        String[] parts = base64Image.split(",");
        String extension = "jpg"; // Default
        if (parts[0].contains("png"))
            extension = "png";
        else if (parts[0].contains("jpeg"))
            extension = "jpg";
        else if (parts[0].contains("gif"))
            extension = "gif";
        else if (parts[0].contains("webp"))
            extension = "webp";

        byte[] imageBytes = Base64.getDecoder().decode(parts[1]);

        // Generate filename
        String fileName = UUID.randomUUID().toString() + "." + extension;
        File file = new File(directory, fileName);

        // Save file
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(imageBytes);
        }

        return "/uploads/" + subFolder + "/" + fileName;
    }
}
