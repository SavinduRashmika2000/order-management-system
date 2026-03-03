package savindu_rashmika.order.management.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import savindu_rashmika.order.management.system.entities.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String username;
    private String password;
    private Role role;
}
