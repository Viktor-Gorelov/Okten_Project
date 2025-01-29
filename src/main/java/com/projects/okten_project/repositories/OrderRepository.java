package com.projects.okten_project.repositories;

import com.projects.okten_project.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT DISTINCT a.groupName FROM Order a")
    List<String> findAllUniqueGroups();
}
