package com.smartpark.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.Map;

@RestController
@RequestMapping("/api/parking")
public class ProxyStreamController {

    @GetMapping("/proxy-stream")
    public ResponseEntity<?> proxyStream(@RequestParam("url") String streamUrl, HttpServletResponse response) {
        if (streamUrl == null || streamUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "URL is required"));
        }

        try {
            URL url = URI.create(streamUrl).toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(30000);

            int responseCode = connection.getResponseCode();
            if (responseCode != 200) {
                return ResponseEntity.status(responseCode)
                        .body(Map.of("message", "Upstream stream error"));
            }

            String contentType = connection.getContentType();
            if (contentType == null) {
                contentType = "image/jpeg";
            }

            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            response.setContentType(contentType);

            InputStream inputStream = connection.getInputStream();
            StreamingResponseBody responseBody = outputStream -> {
                byte[] buffer = new byte[4096];
                int bytesRead;
                try {
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                    outputStream.flush();
                } catch (Exception e) {
                    // client closed connection or read timed out
                } finally {
                    try {
                        inputStream.close();
                    } catch (Exception ignored) {}
                    connection.disconnect();
                }
            };

            return new ResponseEntity<>(responseBody, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to proxy stream", "error", e.getMessage()));
        }
    }
}
