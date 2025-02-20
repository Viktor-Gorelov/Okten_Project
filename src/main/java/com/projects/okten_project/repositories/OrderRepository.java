package com.projects.okten_project.repositories;

import com.projects.okten_project.entities.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT DISTINCT a.groupName FROM Order a")
    List<String> findAllUniqueGroups();

    @Query("SELECT o FROM Order o WHERE " +
            "(:name IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:surname IS NULL OR LOWER(o.surname) LIKE LOWER(CONCAT('%', :surname, '%'))) AND " +
            "(:email IS NULL OR LOWER(o.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:phone IS NULL OR o.phone LIKE CONCAT('%', :phone, '%')) AND " +
            "(:age IS NULL OR CAST(o.age AS string) LIKE CONCAT('%', :age, '%')) AND " +
            "(:course IS NULL OR o.course = :course) AND " +
            "(:courseFormat IS NULL OR o.courseFormat = :courseFormat) AND " +
            "(:courseType IS NULL OR o.courseType = :courseType) AND " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:group IS NULL OR o.groupName = :group) AND " +
            "(:startDate IS NULL OR :endDate IS NULL OR o.createdAt BETWEEN :startDate AND :endDate) AND " +
            "(:currentUser IS NULL OR o.manager = :currentUser)")
    Page<Order> findOrdersWithFilters(
            String name, String surname, String email, String phone, Integer age,
            String course, String courseFormat, String courseType, String status, String group,
            LocalDateTime startDate, LocalDateTime endDate, String currentUser, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(String status);

    @Query("SELECT o.manager, COUNT(o), " +
            "SUM(CASE WHEN o.status = 'New' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN o.status = 'In Work' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN o.status = 'Agree' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN o.status = 'Disagree' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN o.status = 'Dubbing' THEN 1 ELSE 0 END) " +
            "FROM Order o WHERE o.manager IS NOT NULL GROUP BY o.manager")
    List<Object[]> getManagerStatistics();
}
