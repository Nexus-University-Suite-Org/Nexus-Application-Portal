package org.nexus.napbackend.scoring;

import java.util.List;
import java.util.Optional;

/**
 * Outcome of reading a subject blob, including whether the read succeeded.
 *
 * <p>The previous code returned an empty list on any parse failure and the
 * caller scored that as 0, so unreadable data silently became a rejection. The
 * failure is now carried explicitly so the caller can force a review.
 */
public record SubjectParseResult(
        List<SubjectGrade> subjects,
        DataQuality dataQuality,
        Optional<String> parseError
) {

    public static SubjectParseResult missing() {
        DataQuality dq = new DataQuality(java.util.Set.of(DataQuality.Flag.MISSING_SUBJECTS));
        return new SubjectParseResult(List.of(), dq, Optional.of("no subject record supplied"));
    }

    public static SubjectParseResult unreadable(String error) {
        DataQuality dq = new DataQuality(java.util.Set.of(
                DataQuality.Flag.MISSING_SUBJECTS,
                DataQuality.Flag.UNREADABLE_SUBJECTS));
        return new SubjectParseResult(List.of(), dq, Optional.ofNullable(error));
    }

    public boolean isUsable() {
        return parseError.isEmpty();
    }

    public int size() {
        return subjects.size();
    }
}
