package savindu_rashmika.order.management.system.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import savindu_rashmika.order.management.system.dto.DashboardStatsResponse;
import savindu_rashmika.order.management.system.services.DashboardService;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(@RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(dashboardService.getStats(userId));
    }
}
