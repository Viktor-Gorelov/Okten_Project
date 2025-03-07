package com.projects.okten_project.controller;

import com.projects.okten_project.dto.error.ErrorDTO;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ErrorController {

    @ExceptionHandler({
            MalformedJwtException.class,
            ExpiredJwtException.class,
            IllegalStateException.class,
            DateTimeParseException.class,
            RuntimeException.class
    })
    public ResponseEntity<ErrorDTO> handleExceptions(RuntimeException e) {
        System.out.println("Handled exception: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(e));
    }

    private ErrorDTO buildErrorResponse(Exception e) {
        return ErrorDTO.builder()
                .details(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        System.out.println("Handled exception: " + ex.getMessage());
        ex.printStackTrace();
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
