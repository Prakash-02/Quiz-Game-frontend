package com.quizgame.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    public String upload(MultipartFile file, String folder) throws IOException {
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            return null;
        }
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "quizgame/" + folder,
                        "resource_type", "auto"
                )
        );
        return (String) result.get("secure_url");
    }
}
