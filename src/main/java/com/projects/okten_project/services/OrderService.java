package com.projects.okten_project.services;

import com.projects.okten_project.dto.comment.CommentDTO;
import com.projects.okten_project.dto.order.OrderDTO;
import com.projects.okten_project.entities.Comment;
import com.projects.okten_project.entities.Order;
import com.projects.okten_project.entities.User;
import com.projects.okten_project.mapper.OrderMapper;
import com.projects.okten_project.repositories.CommentRepository;
import com.projects.okten_project.repositories.OrderRepository;
import com.projects.okten_project.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public Page<OrderDTO> getOrdersWithPagination(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderMapper::mapToDTO);
    }

    public OrderDTO getOrderById(Long id){
        Order order = findOrder(id);
        return orderMapper.mapToDTO(order);
    }

    private Order findOrder(Long id){
        return orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("user with this id isn't present"));
    }

    public List<CommentDTO> getCommentsByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found with id: " + orderId));

        return order.getCommentsList().stream()
                .map(comment -> CommentDTO.builder()
                        .text(comment.getText())
                        .owner_id(comment.getOwner_id().getId())
                        .manager(order.getManager())
                        .created_at(comment.getCreated_at().format(DateTimeFormatter.ofPattern("MMMM d, yyyy")))
                        .build())
                .toList();
    }

    public List<String> getAllGroups(){
        return orderRepository.findAllUniqueGroups();
    }

    @Transactional
    public OrderDTO addCommentToOrder(Long order_id, String owner_name, CommentDTO commentDTO) {
        Order order = orderRepository.findById(order_id)
                .orElseThrow(() -> new NoSuchElementException("Order not found with id: " + order_id));
        User user = userRepository.findByUsername(owner_name);

        if (order.getManager() != null && !order.getManager().equals(commentDTO.getManager())) {
            throw new IllegalStateException("This order is already managed by another user.");
        }

        Comment comment = Comment.builder()
                .text(commentDTO.getText())
                .owner_id(user)
                .created_at(LocalDateTime.now())
                .order_id(order)
                .build();
        Comment savedComment = commentRepository.save(comment);

        order.setManager(commentDTO.getManager());
        if (order.getStatus() == null || order.getStatus().equalsIgnoreCase("New")) {
            order.setStatus("In Work");
        }
        order.getCommentsList().add(savedComment);
        Order savedOrder = orderRepository.save(order);

        return orderMapper.mapToDTO(savedOrder);
    }

    public OrderDTO updateOrder(Long order_id, OrderDTO orderDTO) {
        Order order = orderRepository.findById(order_id)
                .orElseThrow(() -> new NoSuchElementException("Order not found with id: " + order_id));

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
        order.setManager(orderDTO.getManager());
        order.setGroupName(orderDTO.getGroupName());

        Order savedOrder = orderRepository.save(order);
        return orderMapper.mapToDTO(savedOrder);
    }
}