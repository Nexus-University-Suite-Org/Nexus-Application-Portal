package org.nexus.napbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.dto.ProgrammeResponse;
import org.nexus.napbackend.model.Programme;
import org.nexus.napbackend.repository.ProgrammeRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class ProgrammeService {

    private final ProgrammeRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProgrammeService(ProgrammeRepository repository) {
        this.repository = repository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedProgrammes() {
        if (repository.count() > 0) return;
        List<Programme> programmes = List.of(
            // College of Computing & Information Technology
            programme("BSC-CS", "Bachelor of Science in Computer Science", "College of Computing & Information Technology", 44.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Economics\"]", "[\"General Paper\",\"Sub Mathematics\",\"Sub ICT\"]"),
            programme("BSC-IST", "Bachelor of Science in Information Systems & Technology", "College of Computing & Information Technology", 42.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Economics\",\"Computer Studies\"]", "[\"General Paper\",\"Sub Mathematics\"]"),
            programme("BSC-SE", "Bachelor of Science in Software Engineering", "College of Computing & Information Technology", 45.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Computer Studies\"]", "[\"General Paper\",\"Sub ICT\"]"),
            programme("BSC-DS", "Bachelor of Science in Data Science", "College of Computing & Information Technology", 46.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Economics\"]", "[\"General Paper\",\"Sub Mathematics\"]"),
            programme("BSC-CSAI", "Bachelor of Science in Computer Science & AI", "College of Computing & Information Technology", 47.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Computer Studies\"]", "[\"General Paper\",\"Sub Mathematics\"]"),
            programme("BCS-NET", "Bachelor of Science in Network & Cyber Security", "College of Computing & Information Technology", 43.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Economics\"]", "[\"General Paper\",\"Sub ICT\"]"),

            // College of Law
            programme("LLB", "Bachelor of Laws", "College of Law", 50.0,
                "[\"History\",\"Divinity\"]", "[\"English Literature\",\"Economics\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-CRIM", "Bachelor of Science in Criminology & Security Studies", "College of Law", 42.0,
                "[\"History\",\"Government\"]", "[\"Economics\",\"English Literature\"]", "[\"General Paper\"]"),
            programme("BA-POL", "Bachelor of Arts in Political Science", "College of Law", 38.0,
                "[\"History\",\"Government\"]", "[\"Economics\",\"Geography\"]", "[\"General Paper\"]"),
            programme("LLB-EX", "Bachelor of Laws (External)", "College of Law", 45.0,
                "[\"History\",\"Divinity\"]", "[\"English Literature\",\"Economics\"]", "[\"General Paper\"]"),

            // College of Health Sciences
            programme("MBCHB", "Bachelor of Medicine & Surgery", "College of Health Sciences", 57.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-NUR", "Bachelor of Science in Nursing", "College of Health Sciences", 50.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-PHAR", "Bachelor of Pharmacy", "College of Health Sciences", 53.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-RAD", "Bachelor of Science in Radiography", "College of Health Sciences", 48.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-ANES", "Bachelor of Science in Anaesthesia", "College of Health Sciences", 46.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-OPT", "Bachelor of Science in Optometry", "College of Health Sciences", 45.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-ENT", "Bachelor of Science in ENT & Oral Health", "College of Health Sciences", 44.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-PT", "Bachelor of Science in Physiotherapy", "College of Health Sciences", 43.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-MTL", "Bachelor of Science in Medical Laboratory Science", "College of Health Sciences", 47.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),

            // College of Business & Management Sciences
            programme("BBA", "Bachelor of Business Administration", "College of Business & Management Sciences", 38.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Government\"]", "[\"General Paper\"]"),
            programme("BSC-ACC", "Bachelor of Science in Accounting", "College of Business & Management Sciences", 40.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BSC-MKT", "Bachelor of Science in Marketing", "College of Business & Management Sciences", 36.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-FIN", "Bachelor of Science in Finance", "College of Business & Management Sciences", 41.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Government\"]", "[\"General Paper\"]"),
            programme("BSC-ECO", "Bachelor of Science in Economics", "College of Business & Management Sciences", 42.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BSC-HRM", "Bachelor of Science in Human Resource Management", "College of Business & Management Sciences", 35.0,
                "[\"Economics\",\"Government\"]", "[\"Mathematics\",\"Commerce\"]", "[\"General Paper\"]"),
            programme("BSC-PM", "Bachelor of Science in Procurement & Supply Chain Management", "College of Business & Management Sciences", 34.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-BAD", "Bachelor of Science in Business Data Analytics", "College of Business & Management Sciences", 39.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Computer Studies\",\"Commerce\"]", "[\"General Paper\"]"),
            programme("BSC-TM", "Bachelor of Science in Tourism & Hospitality Management", "College of Business & Management Sciences", 33.0,
                "[\"Geography\",\"Economics\"]", "[\"History\",\"Commerce\"]", "[\"General Paper\"]"),

            // College of Education
            programme("BED-ARTS", "Bachelor of Education (Arts)", "College of Education", 32.0,
                "[\"History\",\"English Literature\"]", "[\"Geography\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BED-SCI", "Bachelor of Education (Science)", "College of Education", 34.0,
                "[\"Mathematics\",\"Biology\"]", "[\"Chemistry\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BED-PRIM", "Bachelor of Education (Primary)", "College of Education", 30.0,
                "[\"History\",\"English Literature\"]", "[\"Geography\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BED-ECE", "Bachelor of Education (Early Childhood)", "College of Education", 28.0,
                "[\"History\",\"English Literature\"]", "[\"Divinity\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BED-SEC", "Bachelor of Education (Secondary)", "College of Education", 31.0,
                "[\"History\",\"English Literature\"]", "[\"Geography\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BSC-EDU", "Bachelor of Science in Education", "College of Education", 33.0,
                "[\"Mathematics\",\"Biology\"]", "[\"Chemistry\",\"Physics\"]", "[\"General Paper\"]"),
            programme("Dip-ED", "Diploma in Education", "College of Education", 25.0,
                "[\"History\",\"English Literature\"]", "[\"Geography\",\"Divinity\"]", "[\"General Paper\"]"),

            // College of Agricultural & Environmental Sciences
            programme("BSC-AGR", "Bachelor of Science in Agriculture", "College of Agricultural & Environmental Sciences", 30.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-FST", "Bachelor of Science in Food Science & Technology", "College of Agricultural & Environmental Sciences", 35.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-ENV", "Bachelor of Science in Environmental Science", "College of Agricultural & Environmental Sciences", 32.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-FM", "Bachelor of Science in Forestry & Natural Resources", "College of Agricultural & Environmental Sciences", 29.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-AGB", "Bachelor of Science in Agribusiness", "College of Agricultural & Environmental Sciences", 31.0,
                "[\"Biology\",\"Mathematics\"]", "[\"Chemistry\",\"Economics\"]", "[\"General Paper\"]"),
            programme("BSC-VET", "Bachelor of Science in Veterinary Medicine", "College of Agricultural & Environmental Sciences", 42.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-HORT", "Bachelor of Science in Horticulture", "College of Agricultural & Environmental Sciences", 28.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-EXT", "Bachelor of Science in Agricultural Extension", "College of Agricultural & Environmental Sciences", 27.0,
                "[\"Biology\",\"Agriculture\"]", "[\"Chemistry\",\"Geography\"]", "[\"General Paper\"]"),

            // College of Engineering, Design & Art
            programme("BENG-CIV", "Bachelor of Engineering in Civil Engineering", "College of Engineering, Design & Art", 46.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BENG-ELE", "Bachelor of Engineering in Electrical Engineering", "College of Engineering, Design & Art", 47.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BENG-MEC", "Bachelor of Engineering in Mechanical Engineering", "College of Engineering, Design & Art", 45.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BENG-COM", "Bachelor of Engineering in Computer Engineering", "College of Engineering, Design & Art", 48.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Computer Studies\"]", "[\"General Paper\"]"),
            programme("BENG-STR", "Bachelor of Engineering in Structural Engineering", "College of Engineering, Design & Art", 44.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BSC-ARCH", "Bachelor of Science in Architecture", "College of Engineering, Design & Art", 43.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Chemistry\"]", "[\"General Paper\"]"),
            programme("BSC-QS", "Bachelor of Science in Quantity Surveying", "College of Engineering, Design & Art", 38.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Chemistry\"]", "[\"General Paper\"]"),
            programme("BSC-URP", "Bachelor of Science in Urban & Regional Planning", "College of Engineering, Design & Art", 37.0,
                "[\"Mathematics\",\"Geography\"]", "[\"Physics\",\"Economics\"]", "[\"General Paper\"]"),
            programme("BID", "Bachelor of Industrial Design", "College of Engineering, Design & Art", 35.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Fine Art\"]", "[\"General Paper\"]"),
            programme("BFA", "Bachelor of Fine Arts", "College of Engineering, Design & Art", 30.0,
                "[\"Fine Art\",\"History\"]", "[\"English Literature\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BA-FA", "Bachelor of Arts in Fashion & Design", "College of Engineering, Design & Art", 32.0,
                "[\"Fine Art\",\"Home Economics\"]", "[\"History\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BENG-MAT", "Bachelor of Engineering in Materials Engineering", "College of Engineering, Design & Art", 42.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BENG-ENV", "Bachelor of Engineering in Environmental Engineering", "College of Engineering, Design & Art", 41.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Biology\"]", "[\"General Paper\"]"),

            // College of Natural Sciences
            programme("BSC-BIO", "Bachelor of Science in Biology", "College of Natural Sciences", 36.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-CHEM", "Bachelor of Science in Chemistry", "College of Natural Sciences", 37.0,
                "[\"Chemistry\",\"Mathematics\"]", "[\"Physics\",\"Biology\"]", "[\"General Paper\"]"),
            programme("BSC-MATH", "Bachelor of Science in Mathematics", "College of Natural Sciences", 38.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Economics\"]", "[\"General Paper\"]"),
            programme("BSC-PHYS", "Bachelor of Science in Physics", "College of Natural Sciences", 39.0,
                "[\"Physics\",\"Mathematics\"]", "[\"Chemistry\",\"Computer Studies\"]", "[\"General Paper\"]"),
            programme("BSC-STAT", "Bachelor of Science in Statistics", "College of Natural Sciences", 37.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Physics\",\"Computer Studies\"]", "[\"General Paper\"]"),
            programme("BSC-BCH", "Bachelor of Science in Biochemistry", "College of Natural Sciences", 40.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-MIC", "Bachelor of Science in Microbiology", "College of Natural Sciences", 39.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-PHY", "Bachelor of Science in Physics with ICT", "College of Natural Sciences", 38.0,
                "[\"Physics\",\"Mathematics\"]", "[\"Chemistry\",\"ICT\"]", "[\"General Paper\"]"),

            // College of Social Sciences
            programme("BA-ECON", "Bachelor of Arts in Economics", "College of Social Sciences", 36.0,
                "[\"Economics\",\"Mathematics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-GOV", "Bachelor of Arts in Government", "College of Social Sciences", 33.0,
                "[\"History\",\"Government\"]", "[\"Economics\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BA-SOC", "Bachelor of Arts in Sociology", "College of Social Sciences", 32.0,
                "[\"History\",\"Economics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-GEO", "Bachelor of Arts in Geography", "College of Social Sciences", 34.0,
                "[\"Geography\",\"Mathematics\"]", "[\"Economics\",\"Biology\"]", "[\"General Paper\"]"),
            programme("BA-PHI", "Bachelor of Arts in Philosophy", "College of Social Sciences", 30.0,
                "[\"History\",\"English Literature\"]", "[\"Divinity\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-PSY", "Bachelor of Arts in Psychology", "College of Social Sciences", 35.0,
                "[\"History\",\"Biology\"]", "[\"Economics\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-SSW", "Bachelor of Arts in Social & Social Work", "College of Social Sciences", 29.0,
                "[\"History\",\"Economics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-COM", "Bachelor of Arts in Communication", "College of Social Sciences", 34.0,
                "[\"English Literature\",\"History\"]", "[\"Economics\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-JOU", "Bachelor of Arts in Journalism", "College of Social Sciences", 36.0,
                "[\"English Literature\",\"History\"]", "[\"Economics\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-INT", "Bachelor of Arts in International Relations", "College of Social Sciences", 37.0,
                "[\"History\",\"Government\"]", "[\"Economics\",\"English Literature\"]", "[\"General Paper\"]"),

            // College of Humanities & Performing Arts
            programme("BA-ENG", "Bachelor of Arts in English", "College of Humanities & Performing Arts", 30.0,
                "[\"English Literature\",\"History\"]", "[\"Divinity\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BA-HIS", "Bachelor of Arts in History", "College of Humanities & Performing Arts", 29.0,
                "[\"History\",\"English Literature\"]", "[\"Geography\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BA-LIT", "Bachelor of Arts in Literature", "College of Humanities & Performing Arts", 31.0,
                "[\"English Literature\",\"History\"]", "[\"Divinity\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-LANG", "Bachelor of Arts in Languages", "College of Humanities & Performing Arts", 28.0,
                "[\"English Literature\",\"French\"]", "[\"History\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BA-MUS", "Bachelor of Arts in Music", "College of Humanities & Performing Arts", 25.0,
                "[\"Music\",\"History\"]", "[\"English Literature\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BA-THEA", "Bachelor of Arts in Theatre & Film", "College of Humanities & Performing Arts", 27.0,
                "[\"History\",\"English Literature\"]", "[\"Fine Art\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BA-PERF", "Bachelor of Arts in Performing Arts", "College of Humanities & Performing Arts", 26.0,
                "[\"Music\",\"History\"]", "[\"English Literature\",\"Fine Art\"]", "[\"General Paper\"]"),
            programme("BA-IRW", "Bachelor of Arts in Iganga-Rwenzori Languages & Writing", "College of Humanities & Performing Arts", 24.0,
                "[\"English Literature\",\"History\"]", "[\"Luganda\",\"Divinity\"]", "[\"General Paper\"]"),

            // East African School of Library & Information Science
            programme("BSC-LIS", "Bachelor of Science in Library & Information Science", "East African School of Library & Information Science", 35.0,
                "[\"Economics\",\"Mathematics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("DIP-LIS", "Diploma in Library & Information Science", "East African School of Library & Information Science", 28.0,
                "[\"Economics\",\"Mathematics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),

            // School of Graduate Studies — additional undergrad-like professional programmes
            programme("BSC-HKI", "Bachelor of Science in Hotel & Institutional catering", "School of Food Technology, Nutrition & Bio-engineering", 30.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Home Economics\"]", "[\"General Paper\"]"),
            programme("BSC-NUT", "Bachelor of Science in Nutrition & Dietetics", "School of Food Technology, Nutrition & Bio-engineering", 34.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Home Economics\"]", "[\"General Paper\"]"),
            programme("BSC-FT", "Bachelor of Science in Food Technology", "School of Food Technology, Nutrition & Bio-engineering", 36.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-BE", "Bachelor of Science in Bio-engineering", "School of Food Technology, Nutrition & Bio-engineering", 40.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),

            // Makerere University Lung Institute
            programme("BSC-RESP", "Bachelor of Science in Respiratory Medicine", "Makerere University Lung Institute", 44.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),

            // Additional popular programmes
            programme("BSC-GIS", "Bachelor of Science in Geographical Information Science", "College of Agricultural & Environmental Sciences", 34.0,
                "[\"Geography\",\"Mathematics\"]", "[\"Physics\",\"Biology\"]", "[\"General Paper\"]"),
            programme("BSC-REM", "Bachelor of Science in Range Management", "College of Agricultural & Environmental Sciences", 27.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Agriculture\"]", "[\"General Paper\"]"),
            programme("BSC-WSM", "Bachelor of Science in Wildlife Management", "College of Agricultural & Environmental Sciences", 28.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-AQU", "Bachelor of Science in Aquaculture & Fisheries Science", "College of Agricultural & Environmental Sciences", 26.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-STR", "Bachelor of Science in Sport Science", "College of Education", 28.0,
                "[\"Biology\",\"Physical Education\"]", "[\"Chemistry\",\"Mathematics\"]", "[\"General Paper\"]"),

            // Health-related additional programmes
            programme("BSC-HSM", "Bachelor of Science in Health Services Management", "College of Health Sciences", 38.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Economics\"]", "[\"General Paper\"]"),
            programme("BSC-EBM", "Bachelor of Science in Environmental Health Management", "College of Health Sciences", 35.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-DH", "Bachelor of Science in Dental Surgery", "College of Health Sciences", 50.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),

            // Additional engineering
            programme("BENG-SUR", "Bachelor of Engineering in Surveying", "College of Engineering, Design & Art", 39.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Geography\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BENG-FOOD", "Bachelor of Engineering in Food Engineering", "College of Engineering, Design & Art", 40.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Biology\"]", "[\"General Paper\"]"),
            programme("BSC-CON", "Bachelor of Science in Construction Management", "College of Engineering, Design & Art", 36.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Economics\"]", "[\"General Paper\"]"),
            programme("BSC-PMK", "Bachelor of Science in Petroleum & Mineral Engineering", "College of Engineering, Design & Art", 43.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),

            // Additional business
            programme("BS-ENTR", "Bachelor of Science in Entrepreneurship", "College of Business & Management Sciences", 33.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Government\"]", "[\"General Paper\"]"),
            programme("BSC-INS", "Bachelor of Science in Insurance", "College of Business & Management Sciences", 36.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-PUB", "Bachelor of Science in Public Administration", "College of Business & Management Sciences", 35.0,
                "[\"Economics\",\"Government\"]", "[\"Mathematics\",\"Geography\"]", "[\"General Paper\"]"),

            // Social Sciences additional
            programme("BA-SOCW", "Bachelor of Social Work & Social Administration", "College of Social Sciences", 30.0,
                "[\"History\",\"Economics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-PUBH", "Bachelor of Arts in Public Health", "College of Social Sciences", 37.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Economics\",\"Mathematics\"]", "[\"General Paper\"]"),

            // Science additional
            programme("BSC-GEO", "Bachelor of Science in Geology", "College of Natural Sciences", 35.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-MAR", "Bachelor of Science in Marine Science", "College of Natural Sciences", 36.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-ZOO", "Bachelor of Science in Zoology", "College of Natural Sciences", 33.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-BOT", "Bachelor of Science in Botany", "College of Natural Sciences", 32.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Geography\"]", "[\"General Paper\"]"),

            // Humanities additional
            programme("BA-CHI", "Bachelor of Arts in Chinese Studies", "College of Humanities & Performing Arts", 32.0,
                "[\"English Literature\",\"History\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-ARA", "Bachelor of Arts in Arabic Studies", "College of Humanities & Performing Arts", 28.0,
                "[\"Arabic\",\"History\"]", "[\"English Literature\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BA-PHL", "Bachelor of Arts in Philosophy & Ethics", "College of Humanities & Performing Arts", 29.0,
                "[\"History\",\"Divinity\"]", "[\"English Literature\",\"Government\"]", "[\"General Paper\"]"),

            // Remaining programmes to reach ~143
            programme("BSC-AGM", "Bachelor of Science in Agricultural Mechanisation", "College of Engineering, Design & Art", 33.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Biology\",\"Chemistry\"]", "[\"General Paper\"]"),
            programme("BSC-WRE", "Bachelor of Science in Water Resources Engineering", "College of Engineering, Design & Art", 42.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-ECO-ED", "Bachelor of Science in Economics & Education", "College of Education", 33.0,
                "[\"Economics\",\"Mathematics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-HRE", "Bachelor of Arts in Human Rights & Peace Studies", "College of Social Sciences", 31.0,
                "[\"History\",\"Government\"]", "[\"English Literature\",\"Economics\"]", "[\"General Paper\"]"),
            programme("BSC-CRM", "Bachelor of Science in Crime Sciences", "College of Law", 39.0,
                "[\"History\",\"Government\"]", "[\"Economics\",\"Biology\"]", "[\"General Paper\"]"),
            programme("BSC-PHL", "Bachelor of Science in Public Health Laboratory", "College of Health Sciences", 45.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-ORT", "Bachelor of Science in Orthopaedic Medicine", "College of Health Sciences", 43.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-EMT", "Bachelor of Science in Emergency Medicine", "College of Health Sciences", 44.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BA-REC", "Bachelor of Arts in Recreation & Leisure Studies", "College of Education", 26.0,
                "[\"Physical Education\",\"Biology\"]", "[\"Geography\",\"History\"]", "[\"General Paper\"]"),
            programme("BSC-HMS", "Bachelor of Science in Human Mobility & Settlement", "College of Social Sciences", 29.0,
                "[\"Geography\",\"Economics\"]", "[\"Mathematics\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-ANT", "Bachelor of Arts in Anthropology", "College of Social Sciences", 30.0,
                "[\"History\",\"Geography\"]", "[\"Biology\",\"Economics\"]", "[\"General Paper\"]"),
            programme("BA-MGA", "Bachelor of Arts in Music & Performing Arts Technology", "College of Humanities & Performing Arts", 25.0,
                "[\"Music\",\"History\"]", "[\"English Literature\",\"Fine Art\"]", "[\"General Paper\"]"),
            programme("BSC-SPI", "Bachelor of Science in Sport & Indoor Recreation", "College of Education", 27.0,
                "[\"Physical Education\",\"Biology\"]", "[\"Chemistry\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-WPT", "Bachelor of Science in Wood & Product Design Technology", "College of Engineering, Design & Art", 31.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Fine Art\"]", "[\"General Paper\"]"),
            programme("BSC-FTK", "Bachelor of Science in Food Technology & Quality Control", "School of Food Technology, Nutrition & Bio-engineering", 35.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-NUS", "Bachelor of Science in Nutritional Sciences", "School of Food Technology, Nutrition & Bio-engineering", 33.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Home Economics\"]", "[\"General Paper\"]"),
            programme("DIP-FT", "Diploma in Food Technology", "School of Food Technology, Nutrition & Bio-engineering", 25.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Home Economics\"]", "[\"General Paper\"]"),
            programme("DIP-NUT", "Diploma in Nutrition", "School of Food Technology, Nutrition & Bio-engineering", 24.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Home Economics\"]", "[\"General Paper\"]"),
            programme("DIP-LAB", "Diploma in Medical Laboratory Technology", "College of Health Sciences", 30.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("DIP-PHAR", "Diploma in Pharmacy", "College of Health Sciences", 32.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Mathematics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("DIP-RAD", "Diploma in Radiography", "College of Health Sciences", 31.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("DIP-NUR", "Diploma in Nursing", "College of Health Sciences", 28.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-PRM", "Bachelor of Science in Primary Medicine", "College of Health Sciences", 49.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BA-MVL", "Bachelor of Arts in Makerere Visual Languages", "College of Humanities & Performing Arts", 24.0,
                "[\"English Literature\",\"History\"]", "[\"Luganda\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BSC-EGY", "Bachelor of Science in Energy Economics", "College of Business & Management Sciences", 37.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Physics\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-TEX", "Bachelor of Science in Textile & Clothing Technology", "College of Engineering, Design & Art", 30.0,
                "[\"Mathematics\",\"Chemistry\"]", "[\"Physics\",\"Home Economics\"]", "[\"General Paper\"]"),
            programme("BA-MKG", "Bachelor of Arts in Marketing & Communication", "College of Business & Management Sciences", 33.0,
                "[\"Economics\",\"Mathematics\"]", "[\"Commerce\",\"English Literature\"]", "[\"General Paper\"]"),
            programme("BSC-PLM", "Bachelor of Science in Plumbing & Water Engineering", "College of Engineering, Design & Art", 29.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Chemistry\"]", "[\"General Paper\"]"),
            programme("BA-SPE", "Bachelor of Arts in Special Needs Education", "College of Education", 28.0,
                "[\"History\",\"English Literature\"]", "[\"Biology\",\"Geography\"]", "[\"General Paper\"]"),
            programme("DIP-COM", "Diploma in Computer Science", "College of Computing & Information Technology", 28.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Computer Studies\"]", "[\"General Paper\"]"),
            programme("DIP-IST", "Diploma in Information Systems Technology", "College of Computing & Information Technology", 26.0,
                "[\"Mathematics\",\"Computer Studies\"]", "[\"Economics\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-FIN-ED", "Bachelor of Science in Finance & Education", "College of Education", 32.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Commerce\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BA-DET", "Bachelor of Arts in Development Studies", "College of Social Sciences", 31.0,
                "[\"History\",\"Economics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-MUS-ED", "Bachelor of Arts in Music Education", "College of Education", 24.0,
                "[\"Music\",\"History\"]", "[\"English Literature\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BSC-BTM", "Bachelor of Science in Biomedical Technology", "College of Health Sciences", 42.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Physics\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BA-FLE", "Bachelor of Arts in French", "College of Humanities & Performing Arts", 28.0,
                "[\"French\",\"English Literature\"]", "[\"History\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BA-GER", "Bachelor of Arts in German", "College of Humanities & Performing Arts", 27.0,
                "[\"German\",\"English Literature\"]", "[\"History\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BA-IRE", "Bachelor of Arts in Islamic Studies", "College of Humanities & Performing Arts", 25.0,
                "[\"Arabic\",\"IRE\"]", "[\"History\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BSC-AIR", "Bachelor of Science in Aircraft Maintenance", "College of Engineering, Design & Art", 40.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BSC-FLE", "Bachelor of Science in Fisheries & Livestock Economics", "College of Agricultural & Environmental Sciences", 29.0,
                "[\"Biology\",\"Economics\"]", "[\"Chemistry\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BA-GVS", "Bachelor of Arts in Gender Studies", "College of Social Sciences", 29.0,
                "[\"History\",\"Economics\"]", "[\"Government\",\"Sociology\"]", "[\"General Paper\"]"),
            programme("BSC-ERG", "Bachelor of Science in Energy Resources Engineering", "College of Engineering, Design & Art", 41.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BA-LGY", "Bachelor of Arts in Luganda", "College of Humanities & Performing Arts", 24.0,
                "[\"Luganda\",\"English Literature\"]", "[\"History\",\"Divinity\"]", "[\"General Paper\"]"),
            programme("BSC-PPM", "Bachelor of Science in Project Planning & Management", "College of Business & Management Sciences", 34.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BSC-IMM", "Bachelor of Science in Industrial & Manufacturing Engineering", "College of Engineering, Design & Art", 43.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BA-CUL", "Bachelor of Arts in Cultural Studies", "College of Humanities & Performing Arts", 26.0,
                "[\"History\",\"English Literature\"]", "[\"Luganda\",\"Fine Art\"]", "[\"General Paper\"]"),
            programme("DIP-ED-SC", "Diploma in Science Education", "College of Education", 27.0,
                "[\"Mathematics\",\"Biology\"]", "[\"Chemistry\",\"Physics\"]", "[\"General Paper\"]"),
            programme("BSC-ECO-STAT", "Bachelor of Science in Economics & Statistics", "College of Business & Management Sciences", 40.0,
                "[\"Mathematics\",\"Economics\"]", "[\"Physics\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-AGR-ED", "Bachelor of Science in Agricultural Education", "College of Education", 28.0,
                "[\"Biology\",\"Agriculture\"]", "[\"Chemistry\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("DIP-MUL", "Diploma in Multimedia & Web Design", "College of Computing & Information Technology", 24.0,
                "[\"Computer Studies\",\"Mathematics\"]", "[\"Fine Art\",\"English Literature\"]", "[\"General Paper\"]"),
            programme("BSC-ENV-ENG", "Bachelor of Science in Environmental Health Engineering", "College of Engineering, Design & Art", 40.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Biology\"]", "[\"General Paper\"]"),
            programme("DIP-URP", "Diploma in Urban & Regional Planning", "College of Engineering, Design & Art", 30.0,
                "[\"Mathematics\",\"Geography\"]", "[\"Economics\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BA-ART-HIS", "Bachelor of Arts in Art History", "College of Humanities & Performing Arts", 27.0,
                "[\"History\",\"Fine Art\"]", "[\"English Literature\",\"Geography\"]", "[\"General Paper\"]"),
            programme("DIP-HRM", "Diploma in Human Resource Management", "College of Business & Management Sciences", 26.0,
                "[\"Economics\",\"Mathematics\"]", "[\"Government\",\"Commerce\"]", "[\"General Paper\"]"),
            programme("BSC-MET", "Bachelor of Science in Meteorology", "College of Natural Sciences", 37.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-WRE-ED", "Bachelor of Science in Water Resources & Education", "College of Education", 30.0,
                "[\"Geography\",\"Mathematics\"]", "[\"Chemistry\",\"Biology\"]", "[\"General Paper\"]"),
            programme("BA-LEA", "Bachelor of Arts in Leadership & Organisational Studies", "College of Business & Management Sciences", 32.0,
                "[\"Economics\",\"Government\"]", "[\"History\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-COM-SCI", "Bachelor of Science in Computer Science & Education", "College of Education", 35.0,
                "[\"Mathematics\",\"Computer Studies\"]", "[\"Physics\",\"Chemistry\"]", "[\"General Paper\"]"),
            programme("DIP-AGR", "Diploma in Agriculture", "College of Agricultural & Environmental Sciences", 22.0,
                "[\"Biology\",\"Agriculture\"]", "[\"Chemistry\",\"Geography\"]", "[\"General Paper\"]"),
            programme("DIP-ENV", "Diploma in Environmental Science", "College of Agricultural & Environmental Sciences", 24.0,
                "[\"Biology\",\"Chemistry\"]", "[\"Geography\",\"Mathematics\"]", "[\"General Paper\"]"),
            programme("BSC-LBR", "Bachelor of Science in Library Science", "East African School of Library & Information Science", 30.0,
                "[\"Economics\",\"English Literature\"]", "[\"Geography\",\"Government\"]", "[\"General Paper\"]"),
            programme("BA-REA", "Bachelor of Arts in Religious Studies", "College of Humanities & Performing Arts", 24.0,
                "[\"Divinity\",\"History\"]", "[\"English Literature\",\"IRE\"]", "[\"General Paper\"]"),
            programme("DIP-AIR", "Diploma in Aircraft Maintenance Engineering", "College of Engineering, Design & Art", 32.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("DIP-CIV", "Diploma in Civil Engineering", "College of Engineering, Design & Art", 30.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("DIP-ELE", "Diploma in Electrical Engineering", "College of Engineering, Design & Art", 31.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("DIP-MEC", "Diploma in Mechanical Engineering", "College of Engineering, Design & Art", 29.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Chemistry\",\"Technical Drawing\"]", "[\"General Paper\"]"),
            programme("BA-POL-ED", "Bachelor of Arts in Political Science & Education", "College of Education", 29.0,
                "[\"History\",\"Government\"]", "[\"Economics\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BA-ENG-ED", "Bachelor of Arts in English & Education", "College of Education", 30.0,
                "[\"English Literature\",\"History\"]", "[\"Divinity\",\"Geography\"]", "[\"General Paper\"]"),
            programme("BSC-SPM", "Bachelor of Science in Sport & Physical Education Management", "College of Education", 27.0,
                "[\"Physical Education\",\"Biology\"]", "[\"Mathematics\",\"Chemistry\"]", "[\"General Paper\"]"),
            programme("DIP-TX", "Diploma in Textile & Clothing Technology", "College of Engineering, Design & Art", 24.0,
                "[\"Mathematics\",\"Chemistry\"]", "[\"Physics\",\"Home Economics\"]", "[\"General Paper\"]"),
            programme("DIP-ARCH", "Diploma in Architecture", "College of Engineering, Design & Art", 28.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Fine Art\"]", "[\"General Paper\"]"),
            programme("DIP-QS", "Diploma in Quantity Surveying", "College of Engineering, Design & Art", 27.0,
                "[\"Mathematics\",\"Physics\"]", "[\"Technical Drawing\",\"Economics\"]", "[\"General Paper\"]")
        );
        var existing = repository.findAll().stream().map(Programme::getCode).collect(java.util.stream.Collectors.toSet());
        var newProgrammes = programmes.stream().filter(p -> !existing.contains(p.getCode())).toList();
        if (!newProgrammes.isEmpty()) {
            repository.saveAll(newProgrammes);
        }
    }

    public List<ProgrammeResponse> findAllActive() {
        return repository.findAllByIsActiveTrueOrderByCode().stream()
                .map(this::toDto)
                .toList();
    }

    public Optional<ProgrammeResponse> findByCode(String code) {
        return repository.findByCode(code).map(this::toDto);
    }

    public Optional<Programme> findEntityByCode(String code) {
        return repository.findByCode(code);
    }

    public List<Programme> findActiveEntities() {
        return repository.findAllByIsActiveTrue();
    }

    private ProgrammeResponse toDto(Programme p) {
        return new ProgrammeResponse(
                p.getId(), p.getCode(), p.getName(), p.getFaculty(),
                p.getMinimumUcePasses(), p.getCutoffScore(),
                p.getEssentialSubjects(), p.getRelevantSubjects(), p.getDesirableSubjects(),
                p.getEntryRequirements(), p.isActive(), p.getCapacity()
        );
    }

    private Programme programme(String code, String name, String faculty, double cutoff,
                                 String essential, String relevant, String desirable) {
        Programme p = new Programme(code, name, faculty, cutoff, essential, relevant, desirable);
        p.setActive(true);
        p.setCapacity(100);
        return p;
    }
}
