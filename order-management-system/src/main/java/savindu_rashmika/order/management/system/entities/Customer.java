package savindu_rashmika.order.management.system.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String shopName;
    private String ownerName;
    private String phoneNo;
    private String email;
    private String city;
    private String address;

    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private String latitude;
    private String longitude;
    private String googleMapLink;

    @Builder.Default
    private boolean isActive = true;
}
