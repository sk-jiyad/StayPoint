package com.jiyad.service;

import com.jiyad.dto.ChatResponse;
import com.jiyad.model.PG;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private RecommendationService recommendationService;

    @Mock
    private LlmClient llm;

    @InjectMocks
    private ChatService chatService;

    @Test
    void greeting_isDetected() {
        ChatResponse r = chatService.reply("hello there");
        assertTrue(r.reply().toLowerCase().contains("quanta"));
        assertTrue(r.pgs().isEmpty());
    }

    @Test
    void faq_whatIsPg_explainsPayingGuest() {
        ChatResponse r = chatService.reply("what is pg?");
        assertTrue(r.reply().contains("Paying Guest"));
        assertTrue(r.pgs().isEmpty());
    }

    @Test
    void recommend_parsesCriteriaAndReturnsPgs() {
        PG pg = new PG();
        pg.setId(1L);
        pg.setName("Sunrise PG");
        pg.setRentSingle(new BigDecimal("5500"));
        when(recommendationService.recommend(eq(6000), eq("girls"), anyList(), any(), eq(4.0), anyInt()))
            .thenReturn(List.of(pg));

        ChatResponse r = chatService.reply("suggest a highly rated pg under 6000 for girls with wifi near Jamia");

        assertEquals(1, r.pgs().size());
        assertEquals("Sunrise PG", r.pgs().get(0).getName());
    }

    @Test
    void recommend_whenNothingFound_repliesGracefully() {
        when(recommendationService.recommend(any(), any(), anyList(), any(), any(), anyInt()))
            .thenReturn(List.of());

        ChatResponse r = chatService.reply("find me a pg under 2000 for boys with ac");

        assertTrue(r.pgs().isEmpty());
        assertTrue(r.reply().toLowerCase().contains("couldn't find"));
    }

    @Test
    void unknown_fallsBack() {
        ChatResponse r = chatService.reply("tell me a joke about cricket");
        assertTrue(r.pgs().isEmpty());
        assertTrue(r.reply().toLowerCase().contains("not sure"));
    }

    @Test
    void fallsBackToRuleBasedWhenLlmErrors() throws Exception {
        when(llm.isEnabled()).thenReturn(true);
        when(llm.complete(any(), anyList(), anyMap())).thenThrow(new RuntimeException("boom"));

        ChatResponse r = chatService.reply("what is pg");

        assertTrue(r.reply().contains("Paying Guest"));
    }
}
