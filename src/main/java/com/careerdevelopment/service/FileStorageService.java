package com.careerdevelopment.service;

import com.careerdevelopment.exception.InvalidFileException;
import com.careerdevelopment.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadDir;

    public FileStorageService(@Value("${cds.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir);
    }

    public StoredFile storeCv(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            throw new InvalidFileException("CV original filename is missing");
        }

        String ext = extensionOf(original).toLowerCase(Locale.ROOT);
        if (!ext.equals("pdf") && !ext.equals("docx")) {
            throw new InvalidFileException("CV file must be PDF or DOCX");
        }

        long maxBytes = 2L * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new InvalidFileException("CV file must be <= 2MB");
        }

        try {
            Files.createDirectories(uploadDir);
            String storedFileName = UUID.randomUUID() + "." + ext;
            Path target = uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), target);

            return new StoredFile(storedFileName, target.toAbsolutePath().toString(), file.getSize());
        } catch (IOException e) {
            throw new InvalidFileException("Failed to store CV file");
        }
    }

    public Resource loadAsResource(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                throw new ResourceNotFoundException("CV file not found");
            }
            return new UrlResource(path.toUri());
        } catch (MalformedURLException e) {
            throw new InvalidFileException("Invalid file path");
        }
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot + 1) : "";
    }

    public record StoredFile(String fileName, String filePath, long fileSize) {}
}

