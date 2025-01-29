package com.projects.okten_project.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    @Pattern(regexp = "^[A-Za-zА-Яа-я\\s]*$", message = "Name should contain only letters")
    private String name;

    @Pattern(regexp = "^[A-Za-zА-Яа-я\\s]*$", message = "Surname should contain only letters")
    private String surname;

    @Email(message = "Invalid email format.")
    @Size(min = 0)
    private String email;

    @Pattern(regexp = "^(^$)|([0-9]{12})", message = "Phone should contain only 12 digits")
    private String phone;

    @Max(value = 100, message = "Age cannot be more than 100")
    @Min(value = 0, message = "Age should be positive")
    private Integer age;

    @Pattern(regexp = "^(FS|QACX|JCX|JSCX|FE|PCX)$", message = "Invalid course")
    private String course;

    @Pattern(regexp = "^(static|online)$", message = "Invalid course format")
    private String courseFormat;

    @Pattern(regexp = "^(pro|minimal|premium|incubator|vip)$", message = "Invalid course type")
    private String courseType;

    @Pattern(regexp = "^(In Work|New|Aggre|Disaggre|Dubbing)$", message = "Invalid status")
    private String status;

    @PositiveOrZero(message = "Sum must be zero or positive")
    private Integer sum;

    @PositiveOrZero(message = "Already paid must be zero or positive")
    private Integer alreadyPaid;
    private LocalDateTime createdAt;
    private String manager;

    @Pattern(regexp = "^[A-Za-zА-Яа-я0-9\\s\\-_.,!@#$%^&*()]*$",
            message = "Group name must contain only letters, numbers, spaces, and special characters.")
    private String groupName;
    private String msg;
    private String utm;

    @OneToMany(fetch = FetchType.EAGER)
    private List<Comment> commentsList = new ArrayList<>();
}
