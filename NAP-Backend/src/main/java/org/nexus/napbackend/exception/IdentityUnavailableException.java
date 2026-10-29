package org.nexus.napbackend.exception;

/**
 * Raised when Nexus Identity cannot be reached or is misconfigured. Login is
 * impossible until it is fixed, so this surfaces as 503 rather than a generic
 * 500 — it tells operators which dependency is down.
 */
public class IdentityUnavailableException extends RuntimeException {

    public IdentityUnavailableException(String message) {
        super(message);
    }

    public IdentityUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
