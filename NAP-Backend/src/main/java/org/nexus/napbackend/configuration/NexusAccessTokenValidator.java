package org.nexus.napbackend.configuration;

import java.util.List;
import java.util.Set;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Extra checks on top of signature, issuer and expiry.
 *
 * <p>The identity server mints ID tokens for the same clients with the same
 * audience, so accepting any well-signed token would let an ID token be replayed
 * as a bearer credential. It also signs tokens for other relying parties, so a
 * token issued to, say, the lecturer portal must not open NAP's admin API.
 */
final class NexusAccessTokenValidator implements OAuth2TokenValidator<Jwt> {

    private final Set<String> allowedAudiences;

    NexusAccessTokenValidator(List<String> allowedAudiences) {
        this.allowedAudiences = Set.copyOf(allowedAudiences);
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        List<String> audience = token.getAudience();
        if (audience == null || audience.stream().noneMatch(allowedAudiences::contains)) {
            return failure("The token was not issued for this API.");
        }
        if (!"access".equals(token.getClaimAsString("token_use"))) {
            return failure("Only access tokens may be used as bearer credentials.");
        }
        return OAuth2TokenValidatorResult.success();
    }

    private static OAuth2TokenValidatorResult failure(String description) {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", description, null));
    }
}
