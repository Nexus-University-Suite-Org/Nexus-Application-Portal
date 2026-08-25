package org.nexus.napbackend.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ContactRateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ContactRateLimitFilter.class);
    private static final String RATE_LIMITED_MESSAGE = "Too many messages sent from this address. Please try again later.";

    private final Map<String, Deque<Long>> hitsByIp = new ConcurrentHashMap<>();
    private final RateLimitProperties properties;

    public ContactRateLimitFilter(RateLimitProperties properties) {
        this.properties = properties;
    }

    public static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!isContactSubmission(request)) {
            chain.doFilter(request, response);
            return;
        }
        String ip = clientIp(request);
        long now = System.currentTimeMillis();
        long windowMillis = properties.windowSeconds() * 1000L;
        Deque<Long> hits = hitsByIp.computeIfAbsent(ip, key -> new ArrayDeque<>());
        synchronized (hits) {
            evictExpired(hits, now, windowMillis);
            if (hits.size() >= properties.maxRequests()) {
                log.debug("Rate limit hit for ip={}", ip);
                reject(response);
                return;
            }
            hits.addLast(now);
        }
        evictEmptyIps();
        chain.doFilter(request, response);
    }

    private boolean isContactSubmission(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String uri = request.getRequestURI();
        return uri.startsWith("/api/v1/contact") || uri.startsWith("/api/contact");
    }

    private void evictExpired(Deque<Long> hits, long now, long windowMillis) {
        while (!hits.isEmpty() && now - hits.peekFirst() > windowMillis) {
            hits.pollFirst();
        }
    }

    private void evictEmptyIps() {
        if (hitsByIp.size() <= 5000) {
            return;
        }
        long now = System.currentTimeMillis();
        long windowMillis = properties.windowSeconds() * 1000L;
        Iterator<Map.Entry<String, Deque<Long>>> iterator = hitsByIp.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Deque<Long>> entry = iterator.next();
            Deque<Long> hits = entry.getValue();
            synchronized (hits) {
                evictExpired(hits, now, windowMillis);
                if (hits.isEmpty()) {
                    iterator.remove();
                }
            }
        }
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/problem+json");
        response.getWriter().write("""
                {"title":"Too Many Requests","status":429,"detail":"%s","message":"%s"}
                """.formatted(RATE_LIMITED_MESSAGE, RATE_LIMITED_MESSAGE));
    }
}
