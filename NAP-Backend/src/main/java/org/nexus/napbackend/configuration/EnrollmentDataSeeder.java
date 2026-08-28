package org.nexus.napbackend.configuration;

import java.util.List;
import org.nexus.napbackend.model.Course;
import org.nexus.napbackend.model.CourseUnit;
import org.nexus.napbackend.repository.CourseRepository;
import org.nexus.napbackend.repository.CourseUnitRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentDataSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;

    public EnrollmentDataSeeder(CourseRepository courseRepository, CourseUnitRepository courseUnitRepository) {
        this.courseRepository = courseRepository;
        this.courseUnitRepository = courseUnitRepository;
    }

    @Override
    public void run(String... args) {
        if (courseRepository.count() > 0) return;

        // --- BSc Computer Science ---
        Course cs = new Course();
        cs.setTenantId(1L);
        cs.setCode("BSCS");
        cs.setName("Bachelor of Science in Computer Science");
        cs.setCollege("Faculty of Computing and Informatics");
        cs.setDepartment("Computer Science");
        cs.setDurationYears(3);
        Course savedCs = courseRepository.save(cs);

        List<CourseUnit> csUnits = List.of(
            buildUnit(savedCs, "CS1101", "Introduction to Programming", 4, 1, 1),
            buildUnit(savedCs, "CS1102", "Computer Fundamentals", 3, 1, 1),
            buildUnit(savedCs, "CS1103", "Mathematics for Computing I", 4, 1, 1),
            buildUnit(savedCs, "CS1104", "Communication Skills", 3, 1, 1),
            buildUnit(savedCs, "CS1201", "Data Structures and Algorithms", 4, 2, 1),
            buildUnit(savedCs, "CS1202", "Discrete Mathematics", 3, 2, 1),
            buildUnit(savedCs, "CS1203", "Digital Electronics", 3, 2, 1),
            buildUnit(savedCs, "CS1204", "Object Oriented Programming", 4, 2, 1),
            buildUnit(savedCs, "CS2101", "Database Management Systems", 4, 1, 2),
            buildUnit(savedCs, "CS2102", "Computer Architecture", 3, 1, 2),
            buildUnit(savedCs, "CS2103", "Operating Systems", 4, 1, 2),
            buildUnit(savedCs, "CS2104", "Software Engineering", 3, 1, 2),
            buildUnit(savedCs, "CS2201", "Computer Networks", 4, 2, 2),
            buildUnit(savedCs, "CS2202", "Artificial Intelligence", 3, 2, 2),
            buildUnit(savedCs, "CS2203", "Web Technologies", 3, 2, 2),
            buildUnit(savedCs, "CS2204", "Theory of Computation", 3, 2, 2),
            buildUnit(savedCs, "CS3101", "Machine Learning", 4, 1, 3),
            buildUnit(savedCs, "CS3102", "Cloud Computing", 3, 1, 3),
            buildUnit(savedCs, "CS3103", "Cyber Security", 3, 1, 3),
            buildUnit(savedCs, "CS3201", "Final Year Project", 6, 2, 3)
        );
        courseUnitRepository.saveAll(csUnits);

        // --- BSc Software Engineering ---
        Course se = new Course();
        se.setTenantId(1L);
        se.setCode("BSSE");
        se.setName("Bachelor of Science in Software Engineering");
        se.setCollege("Faculty of Computing and Informatics");
        se.setDepartment("Software Engineering");
        se.setDurationYears(3);
        Course savedSe = courseRepository.save(se);

        List<CourseUnit> seUnits = List.of(
            buildUnit(savedSe, "SE1101", "Introduction to Programming", 4, 1, 1),
            buildUnit(savedSe, "SE1102", "Software Design Fundamentals", 3, 1, 1),
            buildUnit(savedSe, "SE1103", "Mathematics for Computing I", 4, 1, 1),
            buildUnit(savedSe, "SE1104", "Communication Skills", 3, 1, 1),
            buildUnit(savedSe, "SE1201", "Object Oriented Programming", 4, 2, 1),
            buildUnit(savedSe, "SE1202", "Data Structures and Algorithms", 4, 2, 1),
            buildUnit(savedSe, "SE1203", "Web Development I", 3, 2, 1),
            buildUnit(savedSe, "SE1204", "Discrete Mathematics", 3, 2, 1),
            buildUnit(savedSe, "SE2101", "Software Requirements Engineering", 4, 1, 2),
            buildUnit(savedSe, "SE2102", "Database Management Systems", 4, 1, 2),
            buildUnit(savedSe, "SE2103", "Software Architecture", 3, 1, 2),
            buildUnit(savedSe, "SE2104", "Operating Systems", 3, 1, 2),
            buildUnit(savedSe, "SE2201", "Software Testing and Quality Assurance", 4, 2, 2),
            buildUnit(savedSe, "SE2202", "Software Project Management", 3, 2, 2),
            buildUnit(savedSe, "SE2203", "Mobile Application Development", 3, 2, 2),
            buildUnit(savedSe, "SE2204", "Computer Networks", 3, 2, 2),
            buildUnit(savedSe, "SE3101", "DevOps and Cloud Engineering", 4, 1, 3),
            buildUnit(savedSe, "SE3102", "Software Maintenance and Evolution", 3, 1, 3),
            buildUnit(savedSe, "SE3103", "Advanced Software Engineering", 3, 1, 3),
            buildUnit(savedSe, "SE3201", "Final Year Project", 6, 2, 3)
        );
        courseUnitRepository.saveAll(seUnits);

        // --- BSc Business Computing ---
        Course bc = new Course();
        bc.setTenantId(1L);
        bc.setCode("BSBC");
        bc.setName("Bachelor of Science in Business Computing");
        bc.setCollege("Faculty of Business and Management");
        bc.setDepartment("Business Computing");
        bc.setDurationYears(3);
        Course savedBc = courseRepository.save(bc);

        List<CourseUnit> bcUnits = List.of(
            buildUnit(savedBc, "BC1101", "Introduction to Computing", 4, 1, 1),
            buildUnit(savedBc, "BC1102", "Business Mathematics", 3, 1, 1),
            buildUnit(savedBc, "BC1103", "Principles of Management", 3, 1, 1),
            buildUnit(savedBc, "BC1104", "Communication Skills", 3, 1, 1),
            buildUnit(savedBc, "BC1201", "Introduction to Programming", 4, 2, 1),
            buildUnit(savedBc, "BC1202", "Financial Accounting", 3, 2, 1),
            buildUnit(savedBc, "BC1203", "Business Statistics", 3, 2, 1),
            buildUnit(savedBc, "BC1204", "Microeconomics", 3, 2, 1),
            buildUnit(savedBc, "BC2101", "Database Systems", 4, 1, 2),
            buildUnit(savedBc, "BC2102", "Management Information Systems", 3, 1, 2),
            buildUnit(savedBc, "BC2103", "Business Finance", 3, 1, 2),
            buildUnit(savedBc, "BC2104", "Enterprise Resource Planning", 4, 1, 2),
            buildUnit(savedBc, "BC2201", "E-Commerce Systems", 3, 2, 2),
            buildUnit(savedBc, "BC2202", "Data Analytics for Business", 4, 2, 2),
            buildUnit(savedBc, "BC2203", "Business Process Management", 3, 2, 2),
            buildUnit(savedBc, "BC2204", "IT Project Management", 3, 2, 2),
            buildUnit(savedBc, "BC3101", "Business Intelligence", 4, 1, 3),
            buildUnit(savedBc, "BC3102", "Digital Marketing Systems", 3, 1, 3),
            buildUnit(savedBc, "BC3103", "Strategic IT Management", 3, 1, 3),
            buildUnit(savedBc, "BC3201", "Final Year Project", 6, 2, 3)
        );
        courseUnitRepository.saveAll(bcUnits);

        System.out.println("[DataSeeder] Seeded 3 programs with 60 course units");
    }

    private CourseUnit buildUnit(Course course, String code, String name, int credits, int semester, int year) {
        CourseUnit unit = new CourseUnit();
        unit.setTenantId(1L);
        unit.setCourse(course);
        unit.setCode(code);
        unit.setName(name);
        unit.setCredits(credits);
        unit.setSemester(semester);
        unit.setYear(year);
        return unit;
    }
}
