package com.projects.okten_project.controller;

import com.projects.okten_project.dto.comment.CommentDTO;
import com.projects.okten_project.dto.order.OrderDTO;
import com.projects.okten_project.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        List<String> allowedFields = List.of(
                "id", "name", "surname", "email", "phone", "age", "course",
                "courseFormat", "courseType", "status", "sum", "alreadyPaid", "createdAt", "manager", "groupName"
        );
        if (!allowedFields.contains(sortField)) {
            throw new IllegalArgumentException("Invalid sort field: " + sortField);
        }
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortField);
        PageRequest pageRequest = PageRequest.of(page-1, size, sort);
        return orderService.getOrdersWithPagination(pageRequest);
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
