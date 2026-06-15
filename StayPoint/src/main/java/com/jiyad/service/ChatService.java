package com.jiyad.service;

import com.jiyad.dto.ChatResponse;
import com.jiyad.dto.PGResponseDTO;
import com.jiyad.model.PG;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rule-based chatbot (report §4.2): detects intent from keywords/regex, answers FAQs from a
 * static knowledge base, and for recommendation requests parses budget/gender/amenities/college/
 * rating out of the message and delegates to {@link RecommendationService}. No LLM.
 */
@Service
public class ChatService {

    private enum Intent { GREETING, CAPABILITIES, FAQ, RECOMMEND, FALLBACK }

    private static final Pattern NUMBER = Pattern.compile("\\d{1,6}");
    private static final Pattern LIMIT = Pattern.compile("top\\s+(\\d{1,2})|(\\d{1,2})\\s+(?:best|options|pgs?|places|rooms)");
    private static final Pattern STARS = Pattern.compile("(\\d)\\s*star");

    private final RecommendationService recommendationService;

    public ChatService(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    public ChatResponse reply(String rawMessage) {
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
