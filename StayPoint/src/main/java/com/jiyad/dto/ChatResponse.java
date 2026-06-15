package com.jiyad.dto;

import java.util.List;

/**
 * Reply from the rule-based chatbot: a human-readable message plus any PGs the
 * recommendation engine surfaced (empty for greetings / FAQ answers).
 */
public record ChatResponse(String reply, List<PGResponseDTO> pgs) {

    public static ChatResponse text(String reply) {
        return new ChatResponse(reply, List.of());
    }
}
