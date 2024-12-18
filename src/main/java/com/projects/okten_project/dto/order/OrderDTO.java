package com.projects.okten_project.dto.order;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderDTO {
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String phone;
    private Integer age;
    private String course;
    private String courseFormat;
    private String courseType;
    private String status;
    private Double sum;
    private Double alreadyPaid;
    private String createdAt;
}
