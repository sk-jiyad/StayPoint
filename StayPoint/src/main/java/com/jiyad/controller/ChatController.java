package com.jiyad.controller;

import com.jiyad.dto.ChatResponse;
import com.jiyad.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody Map<String, Object> body) {
        String message = body.get("message") == null ? "" : body.get("message").toString();

        // Optional prior turns: [{role:"user"|"model", text:"..."}] for multi-turn context.
        List<Map<String, String>> history = new ArrayList<>();
        if (body.get("history") instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> turn && turn.get("text") != null) {
                    Object role = turn.get("role");
                    history.add(Map.of(
                        "role", role == null ? "user" : role.toString(),
                        "text", turn.get("text").toString()));
                }
            }
        }
        return ResponseEntity.ok(chatService.reply(message, history));
    }
}
