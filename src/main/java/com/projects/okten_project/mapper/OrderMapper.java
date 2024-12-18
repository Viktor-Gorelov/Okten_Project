package com.projects.okten_project.mapper;

import com.projects.okten_project.dto.order.OrderDTO;
import com.projects.okten_project.entities.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class OrderMapper {

    public OrderDTO mapToDTO(Order order){
        String create_at;
        if(order.getCreatedAt() != null){
            create_at = order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        }
        else {
            create_at = "null";
        }


        return OrderDTO.builder()
                .id(order.getId())
                .name(order.getName())
                .surname(order.getSurname())
                .email(order.getEmail())
                .phone(order.getPhone())
                .age(order.getAge())
                .course(order.getCourse())
                .courseFormat(order.getCourseFormat())
                .courseType(order.getCourseType())
                .status(order.getStatus())
                .sum(order.getSum())
                .alreadyPaid(order.getAlreadyPaid())
                .createdAt(create_at)
                .build();
    }

    public Order mapToOrder(OrderDTO orderDTO){
        Order order = new Order();
        order.setId(orderDTO.getId());
        order.setName(orderDTO.getName());
        order.setSurname(orderDTO.getSurname());
        order.setEmail(orderDTO.getEmail());
        order.setPhone(orderDTO.getPhone());
        order.setAge(orderDTO.getAge());
        order.setCourse(orderDTO.getCourse());
        order.setCourseFormat(orderDTO.getCourseFormat());
        order.setCourseType(orderDTO.getCourseType());
        order.setStatus(orderDTO.getStatus());
        order.setSum(orderDTO.getSum());
        order.setAlreadyPaid(orderDTO.getAlreadyPaid());
        order.setCreatedAt(LocalDateTime.parse(orderDTO.getCreatedAt()));
        return order;
    }
}
