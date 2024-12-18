package com.projects.okten_project.services;

import com.projects.okten_project.dto.order.OrderDTO;
import com.projects.okten_project.entities.Order;
import com.projects.okten_project.mapper.OrderMapper;
import com.projects.okten_project.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
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

    public void deleteOrderById(Long id){
        orderRepository.deleteById(id);
    }
}
