package savindu_rashmika.order.management.system.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import io.jsonwebtoken.ExpiredJwtException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (ex instanceof ExpiredJwtException) {
            message = "Session expired. Please log in again.";
            status = HttpStatus.UNAUTHORIZED;
        } else if (message != null) {
            if (message.contains("Bad credentials") || message.contains("password")) {
                message = "Incorrect username or password";
                status = HttpStatus.UNAUTHORIZED;
            } else if (message.contains("User not found")) {
                message = "User not found";
                status = HttpStatus.UNAUTHORIZED;
            } else if (message.contains("Account is deactivated")) {
                status = HttpStatus.FORBIDDEN;
            }
        } else {
            message = "An unexpected error occurred";
        }

        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}
