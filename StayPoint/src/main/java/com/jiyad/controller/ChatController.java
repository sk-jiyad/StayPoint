package com.jiyad.controller;

import com.jiyad.dto.ChatResponse;
import com.jiyad.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "");
        return ResponseEntity.ok(chatService.reply(message));
    }
}
