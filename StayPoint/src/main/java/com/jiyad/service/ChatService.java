package com.jiyad.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jiyad.dto.ChatResponse;
import com.jiyad.dto.PGResponseDTO;
import com.jiyad.model.PG;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Chatbot service. When a Gemini API key is configured it uses the LLM (natural language,
 * multi-turn) and lets the model decide when to call the recommendation engine via a structured
 * JSON response. When the key is absent — or Gemini errors / rate-limits — it falls back to the
 * original rule-based logic (intent detection + FAQ knowledge base + regex parsing). The recommend
 * results always come from the real {@link RecommendationService}; the LLM never invents listings.
 */
@Service
public class ChatService {

    private enum Intent { GREETING, CAPABILITIES, FAQ, RECOMMEND, FALLBACK }

    private static final Pattern NUMBER = Pattern.compile("\\d{1,6}");
    private static final Pattern LIMIT = Pattern.compile("top\\s+(\\d{1,2})|(\\d{1,2})\\s+(?:best|options|pgs?|places|rooms)");
    private static final Pattern STARS = Pattern.compile("(\\d)\\s*star");

    private static final String SYSTEM = """
        You are the StayPoint assistant. StayPoint is a website that lists paying-guest (PG)
        accommodations across India: owners post listings and students/workers browse, filter and
        contact owners directly. StayPoint takes no commission and does not handle bookings.
        Facts you may use to answer questions:
        - A PG (Paying Guest) is a rented room (single/double/triple-sharing) in a house or hostel,
          usually monthly, often with WiFi and sometimes food included.
        - Documents to move in: a government photo ID (Aadhaar/PAN), passport photos, college or
          employee ID, and an advance deposit (typically 1-2 months' rent).
        - Typical house rules: gate/entry timings, no smoking or alcohol, guests only in common
          areas, keeping noise down - varies by owner.
        - Notice period: usually 15-30 days; the deposit is refunded minus any dues/damages.
        - A "Verified" badge means a StayPoint admin checked the listing - a trust signal, not a
          guarantee; always visit before paying.
        How to respond (always return the JSON schema):
        - If the user wants PG suggestions/recommendations (mentions a budget, gender, amenities, a
          college, or asks to find/suggest/show PGs), set action="recommend" and fill the filters you
          can infer: budget (a number), gender (boys/girls/coed), amenities (from wifi, food, ac,
          laundry, parking, bath), college (name), minRating (1-5 if they want highly rated), limit
          (if they ask for a count). Put a short friendly sentence in "reply" introducing the results.
          Do NOT invent specific PGs - the system fills them in from the real database.
        - Otherwise set action="answer" and put your complete, helpful answer in "reply".
        - Be concise and friendly. Use the conversation history for context (e.g. "with AC too" adds
          to the previous request's filters).
        """;

    private final RecommendationService recommendationService;
    private final GeminiClient geminiClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public ChatService(RecommendationService recommendationService, GeminiClient geminiClient) {
        this.recommendationService = recommendationService;
        this.geminiClient = geminiClient;
    }

    /** Single-turn entry point (no history) — kept for callers/tests. */
    public ChatResponse reply(String rawMessage) {
        return reply(rawMessage, List.of());
    }

    /** Main entry point: LLM when configured, otherwise (or on any error) the rule-based fallback. */
    public ChatResponse reply(String message, List<Map<String, String>> history) {
        if (message == null || message.isBlank()) {
            return ChatResponse.text("Tell me your budget and what you're looking for, or ask me a question about PGs.");
        }
        if (!geminiClient.isEnabled()) {
            return ruleBasedReply(message);
        }
        try {
            return llmReply(message, history == null ? List.of() : history);
        } catch (Exception e) {
            return ruleBasedReply(message);
        }
    }

    // --- LLM path (Gemini) ---

    private ChatResponse llmReply(String message, List<Map<String, String>> history) throws Exception {
        List<Map<String, Object>> contents = new ArrayList<>();
        for (Map<String, String> turn : history) {
            String role = "user".equalsIgnoreCase(turn.get("role")) ? "user" : "model";
            String text = turn.get("text");
            if (text != null && !text.isBlank()) {
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", text))));
            }
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", message))));

        Map<String, Object> genConfig = Map.of(
            "temperature", 0.4,
            "responseMimeType", "application/json",
            "responseSchema", responseSchema()
        );

        JsonNode node = mapper.readTree(geminiClient.complete(SYSTEM, contents, genConfig));
        String action = node.path("action").asText("answer");
        String replyText = node.path("reply").asText("");

        if ("recommend".equalsIgnoreCase(action)) {
            Integer budget = node.hasNonNull("budget") ? node.get("budget").asInt() : null;
            String gender = node.hasNonNull("gender") ? node.get("gender").asText() : null;
            String college = node.hasNonNull("college") ? node.get("college").asText() : null;
            Double minRating = node.hasNonNull("minRating") ? node.get("minRating").asDouble() : null;
            int limit = node.hasNonNull("limit") ? node.get("limit").asInt() : 3;
            List<String> amenities = new ArrayList<>();
            if (node.path("amenities").isArray()) {
                node.path("amenities").forEach(a -> amenities.add(a.asText()));
            }
            List<PG> pgs = recommendationService.recommend(budget, gender, amenities, college, minRating, limit);
            if (replyText.isBlank()) {
                replyText = pgs.isEmpty()
                    ? "I couldn't find any PGs matching that. Try widening your budget or dropping a filter."
                    : "Here are some options that match:";
            }
            return new ChatResponse(replyText, pgs.stream().map(PGResponseDTO::from).toList());
        }

        if (replyText.isBlank()) {
            replyText = "Sorry, could you rephrase that? I can recommend PGs or answer questions about them.";
        }
        return ChatResponse.text(replyText);
    }

    private Map<String, Object> responseSchema() {
        return Map.of(
            "type", "OBJECT",
            "properties", Map.of(
                "action", Map.of("type", "STRING", "enum", List.of("recommend", "answer")),
                "reply", Map.of("type", "STRING"),
                "budget", Map.of("type", "INTEGER"),
                "gender", Map.of("type", "STRING"),
                "amenities", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")),
                "college", Map.of("type", "STRING"),
                "minRating", Map.of("type", "NUMBER"),
                "limit", Map.of("type", "INTEGER")
            ),
            "required", List.of("action", "reply")
        );
    }

    // --- Rule-based fallback (used when Gemini is off or fails) ---

    private ChatResponse ruleBasedReply(String rawMessage) {
        String msg = rawMessage == null ? "" : rawMessage.trim().toLowerCase();
        if (msg.isBlank()) {
            return ChatResponse.text("Tell me your budget and what you're looking for, or ask me a question about PGs.");
        }
        return switch (detectIntent(msg)) {
            case GREETING -> ChatResponse.text(
                "Hi! 👋 I'm the StayPoint assistant. Tell me your budget and what you're looking "
                + "for — e.g. \"a PG under 7000 for boys with food near Delhi University\" — or ask me "
                + "something like \"what documents do I need?\".");
            case CAPABILITIES -> ChatResponse.text(
                "I can do two things 🤖 — answer common questions about PGs (what a PG is, documents "
                + "needed, rules, notice period, the verified badge) and recommend PGs for you. For a "
                + "recommendation tell me your budget, gender (boys/girls/coed), amenities (wifi, food, AC, "
                + "laundry, parking, attached bath) and nearby college. Try: \"Suggest a highly rated PG "
                + "under 6000 for girls with wifi near Jamia\".");
            case FAQ -> ChatResponse.text(faqAnswer(msg));
            case RECOMMEND -> recommend(msg);
            case FALLBACK -> ChatResponse.text(
                "I'm not sure I got that. I can recommend PGs (tell me a budget, gender and amenities) or "
                + "answer questions like \"what is a PG?\", \"what documents do I need?\" or \"what's the "
                + "notice period?\".");
        };
    }

    // --- intent detection ---

    private Intent detectIntent(String msg) {
        if (msg.matches("^(hi|hii+|hey+|hello|yo|namaste|good (morning|afternoon|evening))\\b.*")) {
            return Intent.GREETING;
        }
        if (msg.contains("what can you do") || msg.contains("who are you") || msg.equals("help")
            || msg.contains("what do you do") || msg.contains("how can you help")) {
            return Intent.CAPABILITIES;
        }
        if (faqKey(msg) != null) {
            return Intent.FAQ;
        }
        if (looksLikeRecommend(msg)) {
            return Intent.RECOMMEND;
        }
        return Intent.FALLBACK;
    }

    private boolean looksLikeRecommend(String msg) {
        boolean intentWord = msg.contains("recommend") || msg.contains("suggest") || msg.contains("find")
            || msg.contains("show") || msg.contains("looking for") || msg.contains("need")
            || msg.contains("want") || msg.contains("best");
        boolean subjectWord = msg.contains("pg") || msg.contains("room") || msg.contains("place")
            || msg.contains("hostel") || msg.contains("accommodation") || msg.contains("stay");
        boolean hasBudget = parseBudget(msg) != null;
        boolean hasFilter = parseGender(msg) != null || !parseAmenities(msg).isEmpty();
        return (intentWord && subjectWord) || hasBudget || (subjectWord && hasFilter);
    }

    // --- FAQ knowledge base ---

    private String faqKey(String msg) {
        if (msg.contains("full form") || msg.contains("what is pg") || msg.contains("what's a pg")
            || msg.contains("what is a pg") || msg.contains("meaning of pg")) return "what";
        if (msg.contains("document")) return "documents";
        if (msg.contains("rule")) return "rules";
        if (msg.contains("notice")) return "notice";
        if (msg.contains("verif")) return "verified";
        if (msg.contains("how") && (msg.contains("staypoint") || msg.contains("work")
            || msg.contains("use") || msg.contains("book"))) return "how";
        return null;
    }

    private String faqAnswer(String msg) {
        return switch (faqKey(msg)) {
            case "what" -> "PG stands for Paying Guest — a room (single/double/triple-sharing) in a house "
                + "or hostel that you rent monthly, usually with basics like a bed, WiFi and sometimes "
                + "food included. It's the common student/working-professional housing option in India.";
            case "documents" -> "To move into a PG you usually need: a government photo ID (Aadhaar/PAN), a "
                + "couple of passport photos, your college or employee ID, and an advance deposit "
                + "(typically 1–2 months' rent). The owner will tell you their exact requirement.";
            case "rules" -> "House rules vary by owner, but common ones are: entry/gate timings, no smoking "
                + "or alcohol on the premises, guests only in common areas, and keeping noise down. Ask the "
                + "owner for the full house rules when you call.";
            case "notice" -> "Most PGs ask for 15–30 days' notice before you vacate and refund the deposit "
                + "after deducting any dues or damages. Confirm the exact notice period with the owner.";
            case "verified" -> "A “Verified” badge means a StayPoint admin has checked the listing's "
                + "details. It's a trust signal, not a guarantee — always visit in person before paying.";
            case "how" -> "StayPoint lists PGs from owners directly. Browse or filter on Explore, open a "
                + "listing for photos, rent tiers and amenities, then call or WhatsApp the owner yourself. "
                + "StayPoint takes no commission and doesn't handle bookings.";
            default -> "Ask me about what a PG is, documents needed, house rules, the notice period, or the "
                + "verified badge.";
        };
    }

    // --- recommendation flow ---

    private ChatResponse recommend(String msg) {
        Integer budget = parseBudget(msg);
        String gender = parseGender(msg);
        List<String> amenities = parseAmenities(msg);
        String college = parseCollege(msg);
        Double minRating = parseMinRating(msg);
        int limit = parseLimit(msg);

        List<PG> results = recommendationService.recommend(budget, gender, amenities, college, minRating, limit);
        if (results.isEmpty()) {
            return ChatResponse.text(
                "I couldn't find any PGs matching that. Try raising your budget or dropping a filter "
                + "(for example, ask without the college or amenity).");
        }

        StringBuilder sb = new StringBuilder("Here ");
        sb.append(results.size() == 1 ? "is 1 option" : "are " + results.size() + " options");
        sb.append(describeCriteria(budget, gender, amenities, college, minRating)).append(":");
        List<PGResponseDTO> dtos = results.stream().map(PGResponseDTO::from).toList();
        return new ChatResponse(sb.toString(), dtos);
    }

    private String describeCriteria(Integer budget, String gender, List<String> amenities,
                                    String college, Double minRating) {
        List<String> bits = new ArrayList<>();
        if (budget != null) bits.add("under ₹" + budget);
        if (gender != null) bits.add("for " + gender);
        if (minRating != null) bits.add("rated " + minRating + "+");
        if (!amenities.isEmpty()) bits.add("with " + String.join(", ", amenities));
        if (college != null) bits.add("near " + college);
        return bits.isEmpty() ? "" : " " + String.join(" ", bits);
    }

    // --- parsing helpers ---

    Integer parseBudget(String msg) {
        Matcher m = NUMBER.matcher(msg);
        Integer best = null;
        while (m.find()) {
            int n = Integer.parseInt(m.group());
            if (n >= 1000 && (best == null || n < best)) best = n; // tightest budget mentioned
        }
        return best;
    }

    int parseLimit(String msg) {
        Matcher m = LIMIT.matcher(msg);
        if (m.find()) {
            String g = m.group(1) != null ? m.group(1) : m.group(2);
            int n = Integer.parseInt(g);
            if (n >= 1 && n <= 10) return n;
        }
        return 3;
    }

    String parseGender(String msg) {
        if (msg.contains("girl") || msg.contains("women") || msg.contains("ladies") || msg.contains("female")) return "girls";
        if (msg.contains("boy") || msg.contains("men") || msg.contains("gents") || msg.contains("male")) return "boys";
        if (msg.contains("coed") || msg.contains("co-ed") || msg.contains("unisex")) return "coed";
        return null;
    }

    List<String> parseAmenities(String msg) {
        List<String> found = new ArrayList<>();
        if (msg.contains("wifi") || msg.contains("wi-fi") || msg.contains("internet")) found.add("wifi");
        if (msg.contains("food") || msg.contains("meal") || msg.contains("mess") || msg.contains("tiffin")) found.add("food");
        if (msg.matches(".*\\bac\\b.*") || msg.contains("air condition")) found.add("ac");
        if (msg.contains("laundry") || msg.contains("washing")) found.add("laundry");
        if (msg.contains("parking")) found.add("parking");
        if (msg.contains("attached bath") || msg.contains("attached washroom") || msg.contains("attached toilet")) found.add("bath");
        return found;
    }

    Double parseMinRating(String msg) {
        if (msg.contains("highly rated") || msg.contains("highly-rated") || msg.contains("top rated")
            || msg.contains("best rated") || msg.contains("well rated") || msg.contains("good rating")
            || msg.contains("well reviewed") || msg.contains("good review")) {
            return 4.0;
        }
        Matcher m = STARS.matcher(msg);
        if (m.find()) {
            double n = Double.parseDouble(m.group(1));
            if (n >= 1 && n <= 5) return n;
        }
        return null;
    }

    String parseCollege(String msg) {
        if (msg.contains("jamia")) return "Jamia";
        if (msg.contains("ipu") || msg.contains("ip university") || msg.contains("indraprastha")) return "IP University";
        if (msg.contains("delhi university") || msg.matches(".*\\bdu\\b.*")) return "Delhi University";
        Matcher m = Pattern.compile("near\\s+([a-z][a-z .&]{2,40})").matcher(msg);
        if (m.find()) {
            String c = m.group(1).trim();
            // cut common trailing filler so "near du with wifi" -> "du"
            c = c.replaceAll("\\b(with|under|for|that|having|and|please|pg|room).*$", "").trim();
            if (c.length() >= 2) return c;
        }
        return null;
    }
}
