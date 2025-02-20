package com.projects.okten_project.controller;

import com.projects.okten_project.dto.comment.CommentDTO;
import com.projects.okten_project.dto.order.OrderDTO;
import com.projects.okten_project.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public Page<OrderDTO> getOrdersWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "id") String sortField,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String surname,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String courseFormat,
            @RequestParam(required = false) String courseType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String group,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false, defaultValue = "false") boolean onlyMy
    ) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        LocalDateTime dateStart = null;
        LocalDateTime dateEnd = null;
        if(startDate != null && !startDate.isEmpty()){
            LocalDate dates = LocalDate.parse(startDate, formatter);
            dateStart = dates.atStartOfDay();

        }
        if(endDate != null && !endDate.isEmpty()){
            LocalDate dates = LocalDate.parse(endDate, formatter);
            dateEnd = dates.atStartOfDay();
        }

        return orderService.getOrdersWithFilters(page, size, sortField, sortOrder, name, surname,
                email, phone, age, course, courseFormat, courseType, status, group,
                dateStart, dateEnd, onlyMy ? currentUser : null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id){
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsForOrder(@PathVariable Long id) {
        List<CommentDTO> comments = orderService.getCommentsByOrderId(id);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/groups")
    public ResponseEntity<List<String>> getAllGroups() {
        return ResponseEntity.ok(orderService.getAllGroups());
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getOrdersStatistics() {
        return ResponseEntity.ok(orderService.getOrdersStatistics());
    }

    @GetMapping("/managers/statistics")
    public ResponseEntity<Map<String, Map<String, Number>>> getManagersStatistics() {
        return ResponseEntity.ok(orderService.getManagersStatistics());
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<OrderDTO> addCommentToOrder(
            @PathVariable Long id,
            @RequestBody CommentDTO commentDTO
    ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString();
        OrderDTO updatedOrder = orderService.addCommentToOrder(id, username, commentDTO);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderDTO orderDTO){
        try {
            OrderDTO updatedOrder = orderService.updateOrder(id, orderDTO);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
