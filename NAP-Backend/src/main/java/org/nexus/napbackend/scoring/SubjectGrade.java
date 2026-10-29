package org.nexus.napbackend.scoring;

/**
 * One subject result, with its grade resolved onto the canonical 0-6 scale.
 *
 * @param subject     subject name as submitted
 * @param grade       grade as submitted, normalised to upper case
 * @param points      points on the 0-6 scale, or -1 when the grade was not recognised
 * @param recognised  whether the grade was found in the vocabulary
 */
public record SubjectGrade(String subject, String grade, double points, boolean recognised) {

    public static SubjectGrade unrecognised(String subject, String grade) {
        return new SubjectGrade(subject, grade, -1, false);
    }

    public boolean isPass(double passThresholdPoints) {
        return recognised && points >= passThresholdPoints;
    }
}
