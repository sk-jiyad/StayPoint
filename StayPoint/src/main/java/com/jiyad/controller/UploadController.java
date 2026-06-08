package com.jiyad.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.jiyad.dto.UploadSignatureResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final Cloudinary cloudinary;
    private final String folder;

    public UploadController(Cloudinary cloudinary,
                            @Value("${app.cloudinary.folder:staypoint/pgs}") String folder) {
        this.cloudinary = cloudinary;
        this.folder = folder;
    }

    /**
     * Returns a short-lived signature so the browser can upload directly to Cloudinary.
     * The browser must send back the SAME {folder, timestamp} plus the file and api_key.
     * Secret + signature version come from the configured Cloudinary bean, so the
     * signature always matches what Cloudinary validates against.
     */
    @PostMapping("/signature")
    public ResponseEntity<UploadSignatureResponse> signature() {
        long timestamp = System.currentTimeMillis() / 1000L;
        Map<String, Object> paramsToSign = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", folder);
        String signature = cloudinary.apiSignRequest(
                paramsToSign, cloudinary.config.apiSecret, cloudinary.config.signatureVersion);

        return ResponseEntity.ok(new UploadSignatureResponse(
                timestamp,
                signature,
                cloudinary.config.apiKey,
                cloudinary.config.cloudName,
                folder));
    }
}
