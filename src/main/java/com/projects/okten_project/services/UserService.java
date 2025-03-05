package com.projects.okten_project.services;

import com.projects.okten_project.dto.auth.SignUpRequestDTO;
import com.projects.okten_project.dto.auth.SignUpResponseDTO;
import com.projects.okten_project.dto.user.UserDTO;
import com.projects.okten_project.entities.User;
import com.projects.okten_project.mapper.UserMapper;
import com.projects.okten_project.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

import static com.projects.okten_project.entities.UserRole.MANAGER;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username);
    }

    public User loadUserByEmail(String email) throws UsernameNotFoundException{
        return userRepository.findByEmail(email);
    }

    public UserDTO loadUserDTOByEmail(String email){
        User findUser = userRepository.findByEmail(email);
        OffsetDateTime now = OffsetDateTime.now();
        findUser.setLastLogin(now);
        userRepository.save(findUser);
        return userMapper.mapToDTO(findUser);
    }

    public List<UserDTO> getAllUsers(){
        return userRepository
                .findAll()
                .stream()
                .map(userMapper::mapToDTO)
                .toList();
    }

    public Page<UserDTO> getAllManagersWithPagination(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        return userRepository.findAllManagers(pageRequest).map(userMapper::mapToDTO);
    }

    @Transactional
    public SignUpResponseDTO createAuthorizeUser(SignUpRequestDTO signUpRequestDto, String userRole) {
        String password = passwordEncoder.encode(signUpRequestDto.getPassword());
        User user = User.builder()
                .name(signUpRequestDto.getUsername())
                .password(password)
                .userRole(userRole)
                .build();
        User savedUser = userRepository.save(user);

        return SignUpResponseDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getName())
                .registeredAt(savedUser.getRegisteredAt())
                .build();
    }

    public UserDTO createManager(UserDTO userDTO){
        User user = User.builder()
                .email(userDTO.getEmail())
                .userRole(MANAGER)
                .name(userDTO.getName())
                .surname(userDTO.getSurname())
                .isActive(false)
                .isBanned(false)
                .registeredAt(OffsetDateTime.now())
                .build();
        userRepository.save(user);
        return userMapper.mapToDTO(user);
    }

    public UserDTO getUserById(Long id){
        User user = findUser(id);
        return userMapper.mapToDTO(user);
    }


    public String getUserNameById(Long id){
        User user = findUser(id);
        UserDTO foundUser = userMapper.mapToDTO(user);
        return foundUser.getName();
    }

    private void changeBanStatus(Long id, boolean banStatus){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (user.getIsBanned() == banStatus) {
            throw new IllegalStateException("User is already " + (banStatus ? "banned" : "unbanned"));
        }

        user.setIsBanned(banStatus);
        userRepository.save(user);
    }

    public void banUser(Long id){
        changeBanStatus(id,true);
    }

    public void unBanUser(Long id){
        changeBanStatus(id,false);
    }

    public void saveUser(User user){
        userRepository.save(user);
    }

    public User findUser(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("user with this id isn't present"));
    }

    public void deleteUserById(Long id){
        userRepository.deleteById(id);
    }


    public String encodePassword(String password){
        return passwordEncoder.encode(password);
    }

}