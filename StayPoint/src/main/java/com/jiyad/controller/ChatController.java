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

        // Optional PGs shown in the previous bot turn, so follow-ups ("which is cheapest?",
        // "any with AC?") can be answered against that list.
        List<Map<String, Object>> lastPgs = new ArrayList<>();
        if (body.get("lastPgs") instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> pg && pg.get("name") != null) {
                    Map<String, Object> compact = new java.util.HashMap<>();
                    for (String k : List.of("name", "rentSingle", "gender", "nearbyCollege", "avgRating")) {
                        if (pg.get(k) != null) compact.put(k, pg.get(k));
                    }
                    lastPgs.add(compact);
                }
            }
        }
        return ResponseEntity.ok(chatService.reply(message, history, lastPgs));
    }
}
