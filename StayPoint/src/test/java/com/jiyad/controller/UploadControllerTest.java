package com.jiyad.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.jiyad.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UploadController.class)
@AutoConfigureMockMvc(addFilters = false)
class UploadControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private JwtAuthFilter jwtAuthFilter;

    // Real Cloudinary bean with dummy creds so apiSignRequest actually signs.
    @TestConfiguration
    static class CloudinaryTestConfig {
        @Bean
        Cloudinary cloudinary() {
            return new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", "demo-cloud",
                    "api_key", "test-key",
                    "api_secret", "test-secret",
                    "secure", true));
        }
    }

    @Test
    void signature_returnsSignedPayload() throws Exception {
        mockMvc.perform(post("/api/uploads/signature"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cloudName").value("demo-cloud"))
            .andExpect(jsonPath("$.apiKey").value("test-key"))
            .andExpect(jsonPath("$.folder").value("staypoint/pgs"))
            .andExpect(jsonPath("$.signature").isNotEmpty())
            .andExpect(jsonPath("$.timestamp").isNumber());
    }
}
