package com.projects.okten_project.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;
    @NotBlank(message = "Surname cannot be blank")
    @Size(min = 2, max = 50, message = "Surname must be between 2 and 50 characters")
    private String surname;
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;
    @NotBlank(message = "Phone cannot be blank")
    private String phone;
    @NotNull(message = "Age cannot be null")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 100, message = "Age cannot be more than 100")
    private Integer age;
    @NotBlank(message = "Course cannot be blank")
    private String course;
    @NotBlank(message = "Course format cannot be blank")
    private String courseFormat;
    @NotBlank(message = "Course type cannot be blank")
    private String courseType;
    private String status;
    @PositiveOrZero(message = "Sum must be zero or positive")
    private Double sum;
    @PositiveOrZero(message = "Already paid must be zero or positive")
    private Double alreadyPaid;
    @PastOrPresent(message = "Created date must be in the past or present")
    private LocalDateTime createdAt;
}
