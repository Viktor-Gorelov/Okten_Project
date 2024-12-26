package com.projects.okten_project.services;

import com.projects.okten_project.dto.auth.SignUpRequestDTO;
import com.projects.okten_project.dto.auth.SignUpResponseDTO;
import com.projects.okten_project.dto.user.UserDTO;
import com.projects.okten_project.entities.User;
import com.projects.okten_project.mapper.UserMapper;
import com.projects.okten_project.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

import static com.projects.okten_project.entities.UserRole.MANAGER;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username);
    }

    public List<UserDTO> getAllUsers(){
        return userRepository
                .findAll()
                .stream()
                .map(userMapper::mapToDTO)
                .toList();
    }

    @Transactional
    public SignUpResponseDTO createAuthorizeUser(SignUpRequestDTO signUpRequestDto, String userRole) {
        String password = passwordEncoder.encode(signUpRequestDto.getPassword());
        User user = User.builder()
                .username(signUpRequestDto.getUsername())
                .password(password)
                .userRole(MANAGER)
                .build();
        User savedUser = userRepository.save(user);

        return SignUpResponseDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .registeredAt(savedUser.getRegisteredAt())
                .build();
    }


    public UserDTO getUserById(Long id){
        User user = findUser(id);
        return userMapper.mapToDTO(user);
    }

    private User findUser(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("user with this id isn't present"));
    }

    public void deleteUserById(Long id){
        userRepository.deleteById(id);
    }


}