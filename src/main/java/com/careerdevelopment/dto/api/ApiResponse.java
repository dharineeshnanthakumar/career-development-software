package com.careerdevelopment.dto.api;

/**
 * Standard API response wrapper for both success and error responses.
 *
 * Success example:
 * { "success": true, "message": "...", "data": { ... } }
 *
 * Error example:
 * { "success": false, "message": "...", "data": null, "timestamp": "...", "path": "..." }
 */
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    // Present mainly for error responses
    private String timestamp;
    private String path;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getPath() {
        return path;
    }
}

