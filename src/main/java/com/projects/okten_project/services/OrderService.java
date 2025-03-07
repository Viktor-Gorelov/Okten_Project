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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public Page<OrderDTO> getOrdersWithFilters(
            int page, int size, String sortField, String sortOrder,
            String name, String surname, String email, String phone, Integer age,
            String course, String courseFormat, String courseType, String status, String group,
            LocalDateTime startDate, LocalDateTime endDate, String currentUser) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortField);
        PageRequest pageRequest = PageRequest.of(page - 1, size, sort);

        return orderRepository.findOrdersWithFilters(
                name, surname, email, phone, age, course, courseFormat, courseType,
                status, group, startDate, endDate, currentUser, pageRequest
        ).map(orderMapper::mapToDTO);
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

    public Map<String, Map<String, Number>> getManagersStatistics() {
        List<Object[]> stats = orderRepository.getManagerStatistics();
        Map<String, Map<String, Number>> result = new LinkedHashMap<>();

        for (Object[] stat : stats) {
            Map<String, Number> managerStat = new HashMap<>();
            managerStat.put("total", ((Number) stat[1]).intValue());
            managerStat.put("new", ((Number) stat[2]).intValue());
            managerStat.put("inWork", ((Number) stat[3]).intValue());
            managerStat.put("agree", ((Number) stat[4]).intValue());
            managerStat.put("disagree", ((Number) stat[5]).intValue());
            managerStat.put("dubbing", ((Number) stat[6]).intValue());
            result.put((String)stat[0], managerStat);
        }
        return result;
    }

    @Transactional
    public OrderDTO addCommentToOrder(Long order_id, String email, CommentDTO commentDTO) {
        Order order = orderRepository.findById(order_id)
                .orElseThrow(() -> new NoSuchElementException("Order not found with id: " + order_id));
        User user = userRepository.findByEmail(email);
        if(user == null){
            throw new NoSuchElementException("User not found with email: " + email);
        }

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

    public Map<String, Long> getOrdersStatistics() {
        Map<String, Long> statistics = new HashMap<>();

        statistics.put("total", orderRepository.count());
        statistics.put("agree", orderRepository.countByStatus("Agree"));
        statistics.put("in_work", orderRepository.countByStatus("In Work"));
        statistics.put("disagree", orderRepository.countByStatus("Disagree"));
        statistics.put("dubbing", orderRepository.countByStatus("Dubbing"));
        statistics.put("new", orderRepository.countByStatus("New"));

        return statistics;
    }
}