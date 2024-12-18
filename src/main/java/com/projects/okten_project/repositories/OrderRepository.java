package com.projects.okten_project.repositories;

import com.projects.okten_project.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

}
