package com.jiyad.dto;

/**
 * Everything the browser needs to perform a signed direct upload to Cloudinary.
 * The API secret is never included — only the signature derived from it.
 */
public record UploadSignatureResponse(
        long timestamp,
        String signature,
        String apiKey,
        String cloudName,
        String folder
) {}
